import { BoksTransport } from './transport';
import { WebBluetoothTransport } from './WebBluetoothTransport';
import {
  BoksHistoryEvent,
  BoksOpcode,
  BoksPacket,
  BoksPacketFactory,
  RequestLogsPacket,
  BoksBatteryStats
} from '@/protocol';
import { BoksClientError, BoksClientErrorId } from '@/errors/BoksClientError';
import { fetchBatteryLevel, fetchBatteryStats } from '@/utils/battery';

/**
 * Mapping of log events to their respective context data types.
 */
export interface BoksLogEvents {
  send: { opcode: BoksOpcode; length: number };
  receive: { opcode: BoksOpcode };
  error: { opcode?: BoksOpcode; error: unknown };
  checksum_error: { opcode: number; expected: number; received: number };
  listener_error: { opcode: BoksOpcode; error: unknown };
}

/**
 * Logging function signature for the BoksClient.
 * Ensures the context data matches the event type.
 */
export type BoksLogger = <K extends keyof BoksLogEvents>(
  level: 'info' | 'warn' | 'error' | 'debug',
  event: K,
  context: BoksLogEvents[K]
) => void;

/**
 * Configuration options for the BoksClient.
 */
export interface BoksClientOptions {
  transport?: BoksTransport;
  logger?: BoksLogger;
}

/**
 * High-level client for interacting with a Boks device.
 * Focuses on protocol orchestration and transport abstraction.
 */
export class BoksClient {
  private readonly transport: BoksTransport;
  private readonly logger?: BoksLogger;
  private readonly responseHandlers: Array<{
    opcode: number;
    resolve: (packet: BoksPacket) => void;
  }> = [];
  private listeners: Array<(packet: BoksPacket) => void> = [];
  private commandQueue: Promise<void> = Promise.resolve();

  constructor(optionsOrTransport?: BoksClientOptions | BoksTransport) {
    let transport: BoksTransport | undefined;

    if (optionsOrTransport && 'transport' in optionsOrTransport) {
      transport = optionsOrTransport.transport;
      this.logger = optionsOrTransport.logger;
    } else {
      transport = optionsOrTransport as BoksTransport;
    }

    if (transport) {
      this.transport = transport;
    } else {
      if (typeof navigator === 'undefined' || !navigator.bluetooth) {
        throw new BoksClientError(
          BoksClientErrorId.WEB_BLUETOOTH_NOT_SUPPORTED,
          'No transport provided and Web Bluetooth is not supported.'
        );
      }
      this.transport = new WebBluetoothTransport();
    }
  }

  /**
   * Helper for internal logging.
   */
  private log<K extends keyof BoksLogEvents>(
    level: 'info' | 'warn' | 'error' | 'debug',
    event: K,
    context: BoksLogEvents[K]
  ) {
    if (this.logger) {
      this.logger(level, event, context);
    }
  }

  /**
   * Connects to the Boks device and sets up notification listeners.
   */
  async connect(): Promise<void> {
    await this.transport.connect();
    await this.transport.subscribe((data) => this.handleNotification(data));
  }

  /**
   * Disconnects from the Boks device.
   */
  async disconnect(): Promise<void> {
    await this.transport.disconnect();
  }

  /**
   * Reads the current battery level (standard Bluetooth characteristic).
   * @returns Battery level (0-100) or undefined if unreliable.
   */
  async getBatteryLevel(): Promise<number | undefined> {
    return fetchBatteryLevel(this.transport);
  }

  /**
   * Reads detailed battery statistics (custom Boks characteristic).
   * @returns Battery stats object or undefined if unreliable.
   */
  /**
   * Reads data from a specific BLE characteristic.
   * @param uuid The UUID of the characteristic to read.
   * @returns The raw data as a Uint8Array.
   */
  async readCharacteristic(uuid: string): Promise<Uint8Array> {
    return this.transport.read(uuid);
  }

  async getBatteryStats(): Promise<BoksBatteryStats | undefined> {
    return fetchBatteryStats(this.transport);
  }

  /**
   * Sends a packet to the Boks device using an internal queue to ensure sequential delivery.
   * @param packet The packet to send.
   */
  async send(packet: BoksPacket): Promise<void> {
    const nextTask = this.commandQueue.then(async () => {
      const payload = packet.encode();
      this.log('debug', 'send', { opcode: packet.opcode, length: payload.length });
      await this.transport.write(payload);
    });

    // We catch errors for the queue's sake to ensure next commands can still run
    this.commandQueue = nextTask.catch((err) => {
      this.log('error', 'error', { opcode: packet.opcode, error: err });
    });

    return nextTask;
  }

  /**
   * Subscribes to all incoming packets.
   * @param callback Function called for every parsed packet received.
   * @returns A function to unsubscribe.
   */
  onPacket(callback: (packet: BoksPacket) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  /**
   * Fetches the full history from the Boks device.
   * Accumulates all history events until the end of history packet is received.
   * @param timeoutMs Timeout between two history packets.
   * @returns Array of history events.
   */
  async fetchHistory(timeoutMs: number = 2000): Promise<BoksHistoryEvent[]> {
    const events: BoksHistoryEvent[] = [];

    return new Promise((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | undefined;

      const resetTimer = () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          cleanup();
          reject(new BoksClientError(BoksClientErrorId.TIMEOUT, 'Timeout during history transfer'));
        }, timeoutMs);
      };

      const cleanup = this.onPacket((packet) => {
        if (packet instanceof BoksHistoryEvent) {
          events.push(packet);
          resetTimer();
        } else if (packet.opcode === BoksOpcode.LOG_END_HISTORY) {
          if (timer) clearTimeout(timer);
          cleanup();
          resolve(events);
        }
      });

      resetTimer();
      this.send(new RequestLogsPacket()).catch((err) => {
        if (timer) clearTimeout(timer);
        cleanup();
        reject(err);
      });
    });
  }

  /**
   * Handles incoming data from the transport.
   */
  private handleNotification(data: Uint8Array) {
    try {
      const packet = BoksPacketFactory.createFromPayload(data, (l, e, c) => this.log(l, e, c));
      if (!packet) return;

      this.log('debug', 'receive', { opcode: packet.opcode });

      // Notify generic listeners
      this.listeners.forEach((listener) => {
        try {
          listener(packet);
        } catch (e) {
          this.log('error', 'listener_error', { opcode: packet.opcode, error: e });
        }
      });

      // Check if anyone is waiting for this specific response
      const handlerIndex = this.responseHandlers.findIndex((h) => h.opcode === packet.opcode);
      if (handlerIndex !== -1) {
        const handler = this.responseHandlers[handlerIndex];
        this.responseHandlers.splice(handlerIndex, 1);
        handler.resolve(packet);
      }
    } catch (error) {
      this.log('error', 'error', { error });
    }
  }

  /**
   * Waits for a specific packet opcode to be received.
   * @param opcode The opcode to wait for.
   * @param timeoutMs Timeout in milliseconds.
   */
  waitForPacket<T extends BoksPacket>(opcode: BoksOpcode, timeoutMs: number = 5000): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const idx = this.responseHandlers.findIndex((h) => h.opcode === opcode);
        if (idx !== -1) this.responseHandlers.splice(idx, 1);
        reject(
          new BoksClientError(
            BoksClientErrorId.TIMEOUT,
            `Timeout waiting for opcode 0x${opcode.toString(16)}`
          )
        );
      }, timeoutMs);

      this.responseHandlers.push({
        opcode,
        resolve: (packet) => {
          clearTimeout(timer);
          resolve(packet as T);
        }
      });
    });
  }
}
