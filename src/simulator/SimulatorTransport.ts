import { stringToBytes } from '../utils/converters';
import { BoksTransport } from '../client/transport';
import { BoksHardwareSimulator } from './BoksSimulator';
import { EMPTY_BUFFER } from '../protocol/constants';

/**
 * Transport implementation for the Boks Hardware Simulator.
 */
export class SimulatorTransport implements BoksTransport {
  private simulator: BoksHardwareSimulator;
  private subscriptions: Set<(data: Uint8Array) => void> = new Set();
  private batterySubscriptions: Set<(data: Uint8Array) => void> = new Set();

  constructor(simulator: BoksHardwareSimulator) {
    this.simulator = simulator;
  }

  async connect(): Promise<void> {
    // No-op for simulator
  }

  async disconnect(): Promise<void> {
    for (const callback of this.subscriptions) {
      this.simulator.unsubscribe(callback);
    }
    this.subscriptions.clear();

    for (const callback of this.batterySubscriptions) {
      this.simulator.unsubscribeToBattery(callback);
    }
    this.batterySubscriptions.clear();
  }

  async write(data: Uint8Array): Promise<void> {
    await this.simulator.handlePacket(data);
  }

  async read(uuid: string): Promise<Uint8Array> {
    // Handle GATT reads
    // UUIDs should probably be normalized or checked loosely.
    // BOKS_UUIDS.BATTERY_LEVEL (0x2A19)
    if (uuid.includes('2a19') || uuid.includes('2A19')) {
      const state = this.simulator.getPublicState();
      return new Uint8Array([state.batteryLevel]);
    }
    // Software Rev (0x2A28)
    if (uuid.includes('2a28') || uuid.includes('2A28')) {
      const state = this.simulator.getPublicState();
      return stringToBytes(state.softwareVersion);
    }
    // Firmware Rev (0x2A26)
    if (uuid.includes('2a26') || uuid.includes('2A26')) {
      const state = this.simulator.getPublicState();
      return stringToBytes(state.firmwareVersion);
    }

    return EMPTY_BUFFER;
  }

  async subscribe(callback: (data: Uint8Array) => void): Promise<void> {
    this.subscriptions.add(callback);
    this.simulator.subscribe(callback);
  }

  async subscribeTo(uuid: string, callback: (data: Uint8Array) => void): Promise<void> {
    // If it's battery level
    if (uuid.includes('2a19') || uuid.includes('2A19')) {
      this.batterySubscriptions.add(callback);
      this.simulator.subscribeToBattery(callback);
    }
  }
}
