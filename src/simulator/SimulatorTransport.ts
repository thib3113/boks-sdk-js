import { stringToBytes } from '../utils/converters';
import { BoksTransport } from '../client/transport';
import { BoksHardwareSimulator } from './BoksSimulator';

/**
 * Transport implementation for the Boks Hardware Simulator.
 */
export class SimulatorTransport implements BoksTransport {
  private simulator: BoksHardwareSimulator;

  constructor(simulator: BoksHardwareSimulator) {
    this.simulator = simulator;
  }

  async connect(): Promise<void> {
    // No-op for simulator
  }

  async disconnect(): Promise<void> {
    // No-op for simulator
  }

  async write(data: Uint8Array): Promise<void> {
    await this.simulator.handlePacket(data);
  }

  async read(uuid: string): Promise<Uint8Array> {
    // Handle GATT reads
    // UUIDs should probably be normalized or checked loosely.
    // BOKS_UUIDS.BATTERY_LEVEL (0x2A19)
    if (uuid.includes('2a19') || uuid.includes('2A19')) {
      const state = this.simulator.getState();
      return new Uint8Array([state.batteryLevel]);
    }
    // Software Rev (0x2A28)
    if (uuid.includes('2a28') || uuid.includes('2A28')) {
      const state = this.simulator.getState();
      return stringToBytes(state.softwareVersion);
    }
    // Firmware Rev (0x2A26)
    if (uuid.includes('2a26') || uuid.includes('2A26')) {
      const state = this.simulator.getState();
      return stringToBytes(state.firmwareVersion);
    }

    return new Uint8Array(0);
  }

  async subscribe(callback: (data: Uint8Array) => void): Promise<void> {
    this.simulator.subscribe(callback);
  }
}
