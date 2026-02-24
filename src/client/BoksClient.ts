import { BoksTransport } from './transport';
import { WebBluetoothTransport } from './WebBluetoothTransport';
import {
  BoksHistoryEvent,
  BoksOpcode,
  BoksPacket,
  BoksPacketFactory,
  RequestLogsPacket,
  BoksBatteryStats,
  BOKS_UUIDS
} from '@/protocol';
import { BoksClientError, BoksClientErrorId } from '@/errors/BoksClientError';
import { fetchBatteryLevel, fetchBatteryStats } from '@/utils/battery';
import { BoksTransaction } from './BoksTransaction';

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
  device?: BluetoothDevice;
}

interface TransactionContext {
  transaction: BoksTransaction;
  successOpcodes: number[];
  errorOpcodes: number[];
  resolve: (transaction: BoksTransaction) => void;
  reject: (error: Error) => void;
}

/**
 * High-level client for interacting with a Boks device.
 * Focuses on protocol orchestration and transport abstraction.
 */
export class BoksClient {
  private readonly transport: BoksTransport;
  private readonly logger?: BoksLogger;
  private listeners: Array<(packet: BoksPacket) => void> = [];
  private commandQueue: Promise<void> = Promise.resolve();
  private currentTransactionContext: TransactionContext | null = null;

  constructor(options?: BoksClientOptions) {
    if (options?.transport) {
      this.transport = options.transport;
    } else {
      if (!options?.device && (typeof navigator === 'undefined' || !navigator.bluetooth)) {
        throw new BoksClientError(
          BoksClientErrorId.WEB_BLUETOOTH_NOT_SUPPORTED,
          'No transport provided and Web Bluetooth is not supported.'
        );
      }
      this.transport = new WebBluetoothTransport(options?.device);
    }

    if (options?.logger) {
      this.logger = options.logger;
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
  async getBatteryStats(): Promise<BoksBatteryStats | undefined> {
    return fetchBatteryStats(this.transport);
  }

  /**
   * Reads data from a specific BLE characteristic.
   * @param uuid The UUID of the characteristic to read.
   * @returns The raw data as a Uint8Array.
   */
  async readCharacteristic(uuid: string): Promise<Uint8Array> {
    return this.transport.read(uuid);
  }

  /**
   * Subscribes to battery level notifications.
   * @param callback Function called with the new battery level (0-100).
   */
  async monitorBatteryLevel(callback: (level: number) => void): Promise<void> {
    await this.transport.subscribeTo(BOKS_UUIDS.BATTERY_LEVEL, (data) => {
      if (data.length > 0) {
        callback(data[0]);
      }
    });
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
   * Executes a transaction with the Boks device.
   * Enforces that only one transaction runs at a time.
   *
   * @param request The request packet to send.
   * @param options Configuration for the transaction (success opcodes, timeout, etc).
   * @returns A promise resolving to the completed transaction.
   */
  async execute<TResponse extends BoksPacket = BoksPacket>(
    request: BoksPacket,
    options: {
      successOpcodes: number[];
      errorOpcodes?: number[];
      timeout?: number;
    }
  ): Promise<BoksTransaction<BoksPacket, TResponse>> {
    const nextTask = this.commandQueue.then(async () => {
      const transaction = new BoksTransaction<BoksPacket, TResponse>(request);

      try {
        const payload = request.encode();
        this.log('debug', 'send', { opcode: request.opcode, length: payload.length });

        // Setup the transaction context BEFORE sending to ensure we don't miss immediate responses
        const promise = new Promise<BoksTransaction>((resolve, reject) => {
          const timeoutMs = options.timeout ?? 5000;
          const timer = setTimeout(() => {
            transaction.timeout();
            this.currentTransactionContext = null;
            reject(
              new BoksClientError(
                BoksClientErrorId.TIMEOUT,
                `Transaction timed out after ${timeoutMs}ms (Opcode: 0x${request.opcode.toString(16)})`
              )
            );
          }, timeoutMs);

          this.currentTransactionContext = {
            transaction,
            successOpcodes: options.successOpcodes,
            errorOpcodes: options.errorOpcodes || [],
            resolve: (tx) => {
              clearTimeout(timer);
              resolve(tx);
            },
            reject: (err) => {
              clearTimeout(timer);
              reject(err);
            }
          };
        });

        // Send the packet
        await this.transport.write(payload);

        // Wait for completion
        return (await promise) as BoksTransaction<BoksPacket, TResponse>;
      } catch (err) {
        transaction.fail(err as Error);
        this.currentTransactionContext = null;
        throw err;
      }
    });

    // Ensure the queue continues even if this task fails
    this.commandQueue = nextTask.catch((err) => {
      this.log('error', 'error', { opcode: request.opcode, error: err });
    }) as Promise<void>;

    return nextTask as Promise<BoksTransaction<BoksPacket, TResponse>>;
  }

  /**
   * Fetches the full history from the Boks device using the transaction model.
   * @param timeoutMs Timeout between two history packets.
   * @returns Array of history events.
   */
  async fetchHistory(timeoutMs: number = 2000): Promise<BoksHistoryEvent[]> {
    const transaction = await this.execute(new RequestLogsPacket(), {
      successOpcodes: [BoksOpcode.LOG_END_HISTORY],
      timeout: timeoutMs * 10 // Give enough time for the whole transfer, or handle per-packet timeout?
      // With the current execute model, timeout is for the whole transaction.
      // If history is long, 20s might not be enough.
      // However, the original implementation had a sliding timeout.
      // For now, let's set a generous timeout or rely on the sliding logic if we implement it in execute.
      // Since execute doesn't support sliding timeout natively yet, we'll set a high fixed timeout.
    });

    return transaction.intermediates.filter(
      (p): p is BoksHistoryEvent => p instanceof BoksHistoryEvent
    );
  }

  /**
   * Handles incoming data from the transport.
   */
  private handleNotification(data: Uint8Array) {
    try {
      const packet = BoksPacketFactory.createFromPayload(data, (l, e, c) => this.log(l, e, c));
      if (!packet) return;

      this.log('debug', 'receive', { opcode: packet.opcode });

      // 1. Notify generic listeners
      this.listeners.forEach((listener) => {
        try {
          listener(packet);
        } catch (e) {
          this.log('error', 'listener_error', { opcode: packet.opcode, error: e });
        }
      });

      // 2. Handle active transaction
      if (this.currentTransactionContext) {
        const ctx = this.currentTransactionContext;

        if (ctx.successOpcodes.includes(packet.opcode)) {
          ctx.transaction.complete(packet);
          this.currentTransactionContext = null;
          ctx.resolve(ctx.transaction);
        } else if (ctx.errorOpcodes.includes(packet.opcode)) {
          // Add to intermediates so it's visible in transaction logs
          ctx.transaction.addIntermediate(packet);
          const error = new BoksClientError(
            BoksClientErrorId.UNKNOWN_ERROR,
            `Received error opcode: 0x${packet.opcode.toString(16)}`
          );
          ctx.transaction.fail(error);
          this.currentTransactionContext = null;
          ctx.reject(error);
        } else {
          // If it's not a success or error opcode, it's treated as an intermediate packet
          ctx.transaction.addIntermediate(packet);
        }
      }
    } catch (error) {
      this.log('error', 'error', { error });
    }
  }
}
