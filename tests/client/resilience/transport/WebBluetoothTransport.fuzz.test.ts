import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { WebBluetoothTransport } from '../../../../src/client/WebBluetoothTransport';
import { BoksClientError } from '../../../../src/errors/BoksClientError';

// Mocking standard web bluetooth interfaces
class MockBluetoothRemoteGATTCharacteristic {
  value?: DataView;
  private listeners: Record<string, Function[]> = {};

  async writeValueWithResponse(_data: BufferSource): Promise<void> {
    // Fuzz tests might replace this
  }

  async readValue(): Promise<DataView> {
    return this.value || new DataView(new ArrayBuffer(0));
  }

  async startNotifications(): Promise<void> {
    // Fuzz tests might replace this
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    if (!this.listeners[type]) this.listeners[type] = [];
    if (typeof listener === 'function') {
      this.listeners[type].push(listener);
    }
  }

  // Helper to trigger events
  dispatchEvent(event: Event): boolean {
    const listeners = this.listeners[event.type] || [];
    listeners.forEach((l) => l(event));
    return true;
  }
}

class MockBluetoothRemoteGATTService {
  private chars: Record<string, MockBluetoothRemoteGATTCharacteristic> = {};

  async getCharacteristic(uuid: string): Promise<MockBluetoothRemoteGATTCharacteristic> {
    if (!this.chars[uuid]) {
      this.chars[uuid] = new MockBluetoothRemoteGATTCharacteristic();
    }
    return this.chars[uuid];
  }
}

class MockBluetoothRemoteGATTServer {
  connected = true;
  private services: Record<string, MockBluetoothRemoteGATTService> = {};

  async connect(): Promise<MockBluetoothRemoteGATTServer> {
    this.connected = true;
    return this;
  }

  disconnect(): void {
    this.connected = false;
  }

  async getPrimaryService(uuid: string): Promise<MockBluetoothRemoteGATTService> {
    if (!this.services[uuid]) {
      this.services[uuid] = new MockBluetoothRemoteGATTService();
    }
    return this.services[uuid];
  }

  async getPrimaryServices(): Promise<MockBluetoothRemoteGATTService[]> {
    return Object.values(this.services);
  }
}

class MockBluetoothDevice {
  gatt = new MockBluetoothRemoteGATTServer();
}

describe('WebBluetoothTransport Resilience (Fuzzing)', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      bluetooth: {
        requestDevice: vi.fn().mockResolvedValue(new MockBluetoothDevice())
      }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('FEATURE REGRESSION: should cleanly handle arbitrary payload lengths on write operations without corrupting state', async () => {
    await fc.assert(
      fc.asyncProperty(fc.uint8Array({ minLength: 0, maxLength: 512 }), async (payload) => {
        const transport = new WebBluetoothTransport();
        await transport.connect();

        // The mock characteristic doesn't throw, but we ensure the transport
        // processes the arbitrary buffer seamlessly.
        await expect(transport.write(payload)).resolves.toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  it('FEATURE REGRESSION: should safely wrap unexpected write errors into BoksClientError', async () => {
    await fc.assert(
      fc.asyncProperty(fc.uint8Array({ minLength: 0, maxLength: 512 }), async (payload) => {
        const transport = new WebBluetoothTransport();
        await transport.connect();

        // Inject a fault into the write characteristic
        const writeChar = (transport as any).writeChar;
        const error = new Error('Random BLE connection error');
        vi.spyOn(writeChar, 'writeValueWithResponse').mockRejectedValueOnce(error);

        await expect(transport.write(payload)).rejects.toThrow(BoksClientError);
      }),
      { numRuns: 100 }
    );
  });

  it('FEATURE REGRESSION: should safely handle arbitrary payload lengths on notify events without crashing', async () => {
    await fc.assert(
      fc.asyncProperty(fc.uint8Array({ minLength: 0, maxLength: 512 }), async (payload) => {
        const transport = new WebBluetoothTransport();
        await transport.connect();

        let receivedData: Uint8Array | null = null;
        const callback = (data: Uint8Array) => {
          receivedData = data;
        };

        await transport.subscribe(callback);

        const notifyChar = (transport as any).notifyChar;
        // Mock the Event and target
        const event = {
          type: 'characteristicvaluechanged',
          target: {
            value: new DataView(payload.buffer, payload.byteOffset, payload.byteLength)
          }
        };

        notifyChar.dispatchEvent(event as any);

        expect(receivedData).toEqual(payload);
      }),
      { numRuns: 100 }
    );
  });

  it('FEATURE REGRESSION: should handle notification events safely when value is undefined', async () => {
    const transport = new WebBluetoothTransport();
    await transport.connect();

    let receivedData: Uint8Array | null = null;
    const callback = (data: Uint8Array) => {
      receivedData = data;
    };

    await transport.subscribe(callback);

    const notifyChar = (transport as any).notifyChar;
    // Mock the Event and target, but omit 'value'
    const event = {
      type: 'characteristicvaluechanged',
      target: {
        // value is undefined
      }
    };

    expect(() => {
      notifyChar.dispatchEvent(event as any);
    }).not.toThrow();

    expect(receivedData).toBeNull();
  });
});
