import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebBluetoothTransport } from '@/client/WebBluetoothTransport';
import { BoksClientError, BoksClientErrorId } from '@/errors/BoksClientError';
import { BOKS_UUIDS } from '@/protocol/constants';

// --- Mocks ---

class MockBluetoothRemoteGATTCharacteristic {
  uuid: string;
  value?: DataView;
  listeners: Record<string, ((event: any) => void)[]> = {};

  constructor(uuid: string) {
    this.uuid = uuid;
  }

  async readValue() {
    if (!this.value) {
      throw new Error('Not readable');
    }
    return this.value;
  }

  async writeValueWithResponse(_data: BufferSource) {
    // mock success
  }

  async startNotifications() {
    // mock success
  }

  addEventListener(type: string, listener: (event: any) => void) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(listener);
  }

  // Helper for tests to trigger events
  triggerEvent(type: string, event: any) {
    if (this.listeners[type]) {
      this.listeners[type].forEach(l => l(event));
    }
  }
}

class MockBluetoothRemoteGATTService {
  uuid: string;
  characteristics: Record<string, MockBluetoothRemoteGATTCharacteristic> = {};

  constructor(uuid: string) {
    this.uuid = uuid;
  }

  async getCharacteristic(uuid: string) {
    if (this.characteristics[uuid]) {
      return this.characteristics[uuid];
    }
    throw new Error(`Characteristic ${uuid} not found`);
  }

  // helper to add characteristics for testing
  addCharacteristic(char: MockBluetoothRemoteGATTCharacteristic) {
    this.characteristics[char.uuid] = char;
  }
}

class MockBluetoothRemoteGATTServer {
  connected: boolean = true;
  device: MockBluetoothDevice;
  services: Record<string, MockBluetoothRemoteGATTService> = {};

  constructor(device: MockBluetoothDevice) {
    this.device = device;
  }

  async connect() {
    this.connected = true;
    return this;
  }

  disconnect() {
    this.connected = false;
  }

  async getPrimaryService(uuid: string) {
    if (this.services[uuid]) {
      return this.services[uuid];
    }
    throw new Error(`Service ${uuid} not found`);
  }

  async getPrimaryServices() {
    return Object.values(this.services);
  }

  // helper
  addService(service: MockBluetoothRemoteGATTService) {
    this.services[service.uuid] = service;
  }
}

class MockBluetoothDevice {
  gatt!: MockBluetoothRemoteGATTServer;

  constructor(hasGatt: boolean = true) {
    if (hasGatt) {
      this.gatt = new MockBluetoothRemoteGATTServer(this);
    } else {
      (this as any).gatt = undefined;
    }
  }
}

const mockNavigatorBluetooth = {
  requestDevice: vi.fn(),
};

// --- Tests ---

describe('WebBluetoothTransport', () => {

  beforeEach(() => {
    vi.stubGlobal('navigator', {
        bluetooth: mockNavigatorBluetooth,
    });
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provided device', () => {
      const mockDevice = new MockBluetoothDevice() as unknown as BluetoothDevice;
      const transport = new WebBluetoothTransport(mockDevice);
      // Accessing private field for testing, safe via casting
      expect((transport as any).device).toBe(mockDevice);
    });

    it('should initialize without a device', () => {
      const transport = new WebBluetoothTransport();
      expect((transport as any).device).toBeNull();
    });
  });

  describe('connect', () => {
    it('should throw if navigator.bluetooth is unavailable and no device is provided', async () => {
      vi.stubGlobal('navigator', {}); // override navigator to miss bluetooth
      const transport = new WebBluetoothTransport();
      await expect(transport.connect()).rejects.toThrowError(
        new BoksClientError(
          BoksClientErrorId.WEB_BLUETOOTH_NOT_SUPPORTED,
          'Web Bluetooth is not supported in this environment.'
        )
      );
    });

    it('should throw if navigator is undefined and no device is provided', async () => {
      // simulate non-browser environment
      vi.stubGlobal('navigator', undefined);
      const transport = new WebBluetoothTransport();
      await expect(transport.connect()).rejects.toThrowError(
        new BoksClientError(
          BoksClientErrorId.WEB_BLUETOOTH_NOT_SUPPORTED,
          'Web Bluetooth is not supported in this environment.'
        )
      );
    });

    it('should fallback to navigator.bluetooth.requestDevice if device is NOT provided but available', async () => {
      const device = new MockBluetoothDevice();
      const service = new MockBluetoothRemoteGATTService(BOKS_UUIDS.SERVICE);
      const writeChar = new MockBluetoothRemoteGATTCharacteristic(BOKS_UUIDS.WRITE);
      const notifyChar = new MockBluetoothRemoteGATTCharacteristic(BOKS_UUIDS.NOTIFY);

      service.addCharacteristic(writeChar);
      service.addCharacteristic(notifyChar);
      device.gatt.addService(service);

      mockNavigatorBluetooth.requestDevice.mockResolvedValueOnce(device);

      const transport = new WebBluetoothTransport(); // no device
      await transport.connect();

      expect(mockNavigatorBluetooth.requestDevice).toHaveBeenCalledWith({
        filters: [{ services: [BOKS_UUIDS.SERVICE] }],
        optionalServices: [
          BOKS_UUIDS.SERVICE,
          BOKS_UUIDS.BATTERY_SERVICE,
          BOKS_UUIDS.DEVICE_INFO_SERVICE
        ]
      });
    });


    it('should successfully connect and setup characteristics using pre-provided device', async () => {
      const device = new MockBluetoothDevice();
      const service = new MockBluetoothRemoteGATTService(BOKS_UUIDS.SERVICE);
      const writeChar = new MockBluetoothRemoteGATTCharacteristic(BOKS_UUIDS.WRITE);
      const notifyChar = new MockBluetoothRemoteGATTCharacteristic(BOKS_UUIDS.NOTIFY);

      service.addCharacteristic(writeChar);
      service.addCharacteristic(notifyChar);
      device.gatt.addService(service);

      // Pre-provide device
      const transport = new WebBluetoothTransport(device as unknown as BluetoothDevice);
      await transport.connect();

      // Ensure requestDevice was NOT called
      expect(mockNavigatorBluetooth.requestDevice).not.toHaveBeenCalled();

      expect((transport as any).server).toBe(device.gatt);
      expect((transport as any).writeChar).toBe(writeChar);
      expect((transport as any).notifyChar).toBe(notifyChar);
    });

    it('should throw if device has no GATT server', async () => {
      const device = new MockBluetoothDevice(false);
      mockNavigatorBluetooth.requestDevice.mockResolvedValueOnce(device);

      const transport = new WebBluetoothTransport();
      await expect(transport.connect()).rejects.toThrowError(
        new BoksClientError(
          BoksClientErrorId.CONNECTION_FAILED,
          'GATT Server not available.'
        )
      );
    });

    it('should rethrow existing BoksClientError from try block', async () => {
        const device = new MockBluetoothDevice();
        // Don't add the primary service, so getPrimaryService throws
        mockNavigatorBluetooth.requestDevice.mockResolvedValueOnce(device);

        // Mock device.gatt.connect to throw a BoksClientError explicitly
        vi.spyOn(device.gatt, 'connect').mockRejectedValueOnce(
            new BoksClientError(BoksClientErrorId.CONNECTION_FAILED, 'Mocked Error')
        );

        const transport = new WebBluetoothTransport();
        await expect(transport.connect()).rejects.toThrowError(
             new BoksClientError(BoksClientErrorId.CONNECTION_FAILED, 'Mocked Error')
        );
    });

    it('should wrap general errors in BoksClientError', async () => {
      const error = new Error('User cancelled');
      mockNavigatorBluetooth.requestDevice.mockRejectedValueOnce(error);

      const transport = new WebBluetoothTransport();
      await expect(transport.connect()).rejects.toThrowError(
        new BoksClientError(
          BoksClientErrorId.CONNECTION_FAILED,
          'Failed to connect to Boks device',
          { error }
        )
      );
    });
  });

  describe('disconnect', () => {
    it('should disconnect from GATT server if connected', async () => {
      const device = new MockBluetoothDevice();
      const service = new MockBluetoothRemoteGATTService(BOKS_UUIDS.SERVICE);
      service.addCharacteristic(new MockBluetoothRemoteGATTCharacteristic(BOKS_UUIDS.WRITE));
      service.addCharacteristic(new MockBluetoothRemoteGATTCharacteristic(BOKS_UUIDS.NOTIFY));
      device.gatt.addService(service);
      mockNavigatorBluetooth.requestDevice.mockResolvedValueOnce(device);

      const transport = new WebBluetoothTransport();
      await transport.connect();

      expect(device.gatt.connected).toBe(true);
      await transport.disconnect();
      expect(device.gatt.connected).toBe(false);
    });

    it('should do nothing if not connected', async () => {
      const transport = new WebBluetoothTransport();
      // Should not throw
      await expect(transport.disconnect()).resolves.toBeUndefined();
    });

    it('should catch errors and throw DISCONNECT_FAILED', async () => {
        const device = new MockBluetoothDevice();
        const transport = new WebBluetoothTransport(device as unknown as BluetoothDevice);

        const error = new Error('Failed to stop');
        // Mock server to throw on disconnect
        (transport as any).server = {
            connected: true,
            disconnect: () => { throw error; }
        };

        await expect(transport.disconnect()).rejects.toThrowError(
            new BoksClientError(BoksClientErrorId.DISCONNECT_FAILED, 'Failed to disconnect', { error })
        );
    });
  });

  describe('write', () => {
    it('should throw if writeChar is not available', async () => {
      const transport = new WebBluetoothTransport();
      await expect(transport.write(new Uint8Array([1, 2, 3]))).rejects.toThrowError(
        new BoksClientError(
          BoksClientErrorId.NOT_CONNECTED,
          'Not connected (Write characteristic missing).'
        )
      );
    });

    it('should write value to characteristic successfully', async () => {
      const device = new MockBluetoothDevice();
      const service = new MockBluetoothRemoteGATTService(BOKS_UUIDS.SERVICE);
      const writeChar = new MockBluetoothRemoteGATTCharacteristic(BOKS_UUIDS.WRITE);
      service.addCharacteristic(writeChar);
      service.addCharacteristic(new MockBluetoothRemoteGATTCharacteristic(BOKS_UUIDS.NOTIFY));
      device.gatt.addService(service);
      mockNavigatorBluetooth.requestDevice.mockResolvedValueOnce(device);

      vi.spyOn(writeChar, 'writeValueWithResponse');

      const transport = new WebBluetoothTransport();
      await transport.connect();

      const data = new Uint8Array([0x01, 0x02]);
      await transport.write(data);

      expect(writeChar.writeValueWithResponse).toHaveBeenCalledWith(data);
    });

    it('should throw WRITE_FAILED on error', async () => {
      const transport = new WebBluetoothTransport();
      const mockWriteChar = new MockBluetoothRemoteGATTCharacteristic(BOKS_UUIDS.WRITE);
      const error = new Error('Write fail');
      vi.spyOn(mockWriteChar, 'writeValueWithResponse').mockRejectedValueOnce(error);
      (transport as any).writeChar = mockWriteChar;

      await expect(transport.write(new Uint8Array([1]))).rejects.toThrowError(
        new BoksClientError(
          BoksClientErrorId.WRITE_FAILED,
          'Failed to write to Boks device',
          { error }
        )
      );
    });
  });

  describe('read', () => {
    it('should throw if not connected', async () => {
      const transport = new WebBluetoothTransport();
      await expect(transport.read('some-uuid')).rejects.toThrowError(
        new BoksClientError(BoksClientErrorId.NOT_CONNECTED, 'Not connected to GATT server.')
      );
    });

    it('should successfully read a characteristic found in a service', async () => {
      const device = new MockBluetoothDevice();
      const service = new MockBluetoothRemoteGATTService('service-1');
      const char = new MockBluetoothRemoteGATTCharacteristic('char-1');
      const expectedData = new Uint8Array([4, 5, 6]);
      char.value = new DataView(expectedData.buffer);
      service.addCharacteristic(char);
      device.gatt.addService(service);

      const transport = new WebBluetoothTransport(device as unknown as BluetoothDevice);
      (transport as any).server = device.gatt;

      const data = await transport.read('char-1');
      expect(data).toEqual(expectedData);
    });

    it('should ignore errors from specific characteristic if it fails to read, and continue to search', async () => {
      const device = new MockBluetoothDevice();
      const service1 = new MockBluetoothRemoteGATTService('service-1');
      const service2 = new MockBluetoothRemoteGATTService('service-2');

      const char1 = new MockBluetoothRemoteGATTCharacteristic('char-target'); // will fail read
      const char2 = new MockBluetoothRemoteGATTCharacteristic('char-target'); // will succeed read

      vi.spyOn(char1, 'readValue').mockRejectedValueOnce(new Error('Read error'));
      const expectedData = new Uint8Array([4, 5, 6]);
      char2.value = new DataView(expectedData.buffer);

      service1.addCharacteristic(char1);
      service2.addCharacteristic(char2);
      device.gatt.addService(service1);
      device.gatt.addService(service2);

      const transport = new WebBluetoothTransport(device as unknown as BluetoothDevice);
      (transport as any).server = device.gatt;

      const data = await transport.read('char-target');
      expect(data).toEqual(expectedData);
    });

    it('should throw PARSE_ERROR if characteristic not found in any service', async () => {
      const device = new MockBluetoothDevice();
      const service = new MockBluetoothRemoteGATTService('service-1');
      device.gatt.addService(service); // Service exists but empty

      const transport = new WebBluetoothTransport(device as unknown as BluetoothDevice);
      (transport as any).server = device.gatt;

      await expect(transport.read('missing-char')).rejects.toThrowError(
        new BoksClientError(BoksClientErrorId.PARSE_ERROR, 'Characteristic missing-char not found in any visible service.')
      );
    });

    it('should rethrow general error properly formatted in read block catch', async () => {
       const device = new MockBluetoothDevice();
       const service = new MockBluetoothRemoteGATTService('service-1');
       const expectedError = new Error('Failed to list services');

       const gattServer = device.gatt;
       vi.spyOn(gattServer, 'getPrimaryServices').mockRejectedValueOnce(expectedError);
       device.gatt.addService(service);

       const transport = new WebBluetoothTransport(device as unknown as BluetoothDevice);
       (transport as any).server = gattServer;

       await expect(transport.read('char-1')).rejects.toThrowError(
        new BoksClientError(BoksClientErrorId.PARSE_ERROR, 'Failed to read characteristic char-1', { error: expectedError })
       )
    });
  });

  describe('subscribe', () => {
      it('should throw if notifyChar is missing', async () => {
        const transport = new WebBluetoothTransport();
        await expect(transport.subscribe(vi.fn())).rejects.toThrowError(
            new BoksClientError(BoksClientErrorId.NOT_CONNECTED, 'Not connected (Notify characteristic missing).')
        );
      });

      it('should subscribe and trigger callback on notification', async () => {
          const transport = new WebBluetoothTransport();
          const notifyChar = new MockBluetoothRemoteGATTCharacteristic(BOKS_UUIDS.NOTIFY);
          vi.spyOn(notifyChar, 'startNotifications');
          (transport as any).notifyChar = notifyChar;

          const callback = vi.fn();
          await transport.subscribe(callback);

          expect(notifyChar.startNotifications).toHaveBeenCalled();

          const eventData = new Uint8Array([0xAA, 0xBB]);
          const event = {
              target: {
                  value: new DataView(eventData.buffer)
              }
          };

          notifyChar.triggerEvent('characteristicvaluechanged', event);
          expect(callback).toHaveBeenCalledWith(eventData);
      });

      it('should not trigger callback if value is null', async () => {
          const transport = new WebBluetoothTransport();
          const notifyChar = new MockBluetoothRemoteGATTCharacteristic(BOKS_UUIDS.NOTIFY);
          (transport as any).notifyChar = notifyChar;

          const callback = vi.fn();
          await transport.subscribe(callback);

          const event = {
              target: {
                  value: null
              }
          };

          notifyChar.triggerEvent('characteristicvaluechanged', event);
          expect(callback).not.toHaveBeenCalled();
      });

      it('should throw SUBSCRIBE_FAILED if startNotifications fails', async () => {
          const transport = new WebBluetoothTransport();
          const notifyChar = new MockBluetoothRemoteGATTCharacteristic(BOKS_UUIDS.NOTIFY);
          const error = new Error('fail');
          vi.spyOn(notifyChar, 'startNotifications').mockRejectedValueOnce(error);
          (transport as any).notifyChar = notifyChar;

          await expect(transport.subscribe(vi.fn())).rejects.toThrowError(
               new BoksClientError(BoksClientErrorId.SUBSCRIBE_FAILED, 'Failed to subscribe to notifications', { error })
          );
      });
  });

  describe('subscribeTo', () => {
      it('should continue searching if getCharacteristic returns null instead of throwing', async () => {
          const device = new MockBluetoothDevice();
          const service1 = new MockBluetoothRemoteGATTService('service-1');
          const service2 = new MockBluetoothRemoteGATTService('service-2');
          const char = new MockBluetoothRemoteGATTCharacteristic('target-uuid');

          vi.spyOn(service1, 'getCharacteristic').mockResolvedValueOnce(null as any);
          service2.addCharacteristic(char);
          device.gatt.addService(service1);
          device.gatt.addService(service2);

          const transport = new WebBluetoothTransport(device as unknown as BluetoothDevice);
          (transport as any).server = device.gatt;

          const callback = vi.fn();
          await transport.subscribeTo('target-uuid', callback);
          expect((char.listeners['characteristicvaluechanged'] || []).length).toBe(1);
      });
      it('should throw if server not connected', async () => {
          const transport = new WebBluetoothTransport();
          await expect(transport.subscribeTo('uuid1', vi.fn())).rejects.toThrowError(
              new BoksClientError(BoksClientErrorId.NOT_CONNECTED, 'Not connected (GATT server missing).')
          );
      });

      it('should subscribe to a specific characteristic', async () => {
          const device = new MockBluetoothDevice();
          const service = new MockBluetoothRemoteGATTService('service-1');
          const char = new MockBluetoothRemoteGATTCharacteristic('target-uuid');
          vi.spyOn(char, 'startNotifications');
          service.addCharacteristic(char);
          device.gatt.addService(service);

          const transport = new WebBluetoothTransport(device as unknown as BluetoothDevice);
          (transport as any).server = device.gatt;

          const callback = vi.fn();
          await transport.subscribeTo('target-uuid', callback);

          expect(char.startNotifications).toHaveBeenCalled();

          const eventData = new Uint8Array([0xCC]);
          const event = {
              target: {
                  value: new DataView(eventData.buffer)
              }
          };

          char.triggerEvent('characteristicvaluechanged', event);
          expect(callback).toHaveBeenCalledWith(eventData);
      });

      it('should continue searching for a characteristic if getCharacteristic fails on one service', async () => {
          const device = new MockBluetoothDevice();
          const service1 = new MockBluetoothRemoteGATTService('service-1');
          const service2 = new MockBluetoothRemoteGATTService('service-2');

          const charTarget = new MockBluetoothRemoteGATTCharacteristic('target-uuid');

          // Service 1 does NOT have the char, so it will reject when getting it.
          // Service 2 has the char.
          service2.addCharacteristic(charTarget);
          device.gatt.addService(service1);
          device.gatt.addService(service2);

          const transport = new WebBluetoothTransport(device as unknown as BluetoothDevice);
          (transport as any).server = device.gatt;

          const callback = vi.fn();
          await transport.subscribeTo('target-uuid', callback); // Should not throw

          expect((charTarget.listeners['characteristicvaluechanged'] || []).length).toBe(1);
      });


      it('should handle characteristic value null in subscribeTo', async () => {
          const device = new MockBluetoothDevice();
          const service = new MockBluetoothRemoteGATTService('service-1');
          const char = new MockBluetoothRemoteGATTCharacteristic('target-uuid');
          service.addCharacteristic(char);
          device.gatt.addService(service);

          const transport = new WebBluetoothTransport(device as unknown as BluetoothDevice);
          (transport as any).server = device.gatt;

          const callback = vi.fn();
          await transport.subscribeTo('target-uuid', callback);

          const event = { target: { value: null } };
          char.triggerEvent('characteristicvaluechanged', event);
          expect(callback).not.toHaveBeenCalled();
      });


      it('should throw SUBSCRIBE_FAILED if characteristic not found', async () => {
          const device = new MockBluetoothDevice();
          const service = new MockBluetoothRemoteGATTService('service-1');
          device.gatt.addService(service); // Empty service

          const transport = new WebBluetoothTransport(device as unknown as BluetoothDevice);
          (transport as any).server = device.gatt;

          const error = new BoksClientError(BoksClientErrorId.SUBSCRIBE_FAILED, 'Characteristic missing not found');

          await expect(transport.subscribeTo('missing', vi.fn())).rejects.toThrowError(
              new BoksClientError(BoksClientErrorId.SUBSCRIBE_FAILED, 'Failed to subscribe to missing', { error })
          );
      });

      it('should throw SUBSCRIBE_FAILED on internal error', async () => {
          const device = new MockBluetoothDevice();
          const service = new MockBluetoothRemoteGATTService('service-1');
          const char = new MockBluetoothRemoteGATTCharacteristic('target-uuid');
          const error = new Error('fail');
          vi.spyOn(char, 'startNotifications').mockRejectedValueOnce(error);
          service.addCharacteristic(char);
          device.gatt.addService(service);

          const transport = new WebBluetoothTransport(device as unknown as BluetoothDevice);
          (transport as any).server = device.gatt;

          await expect(transport.subscribeTo('target-uuid', vi.fn())).rejects.toThrowError(
              new BoksClientError(BoksClientErrorId.SUBSCRIBE_FAILED, 'Failed to subscribe to target-uuid', { error })
          );
      });
  });
});
// Add an extra test inside the describe('subscribeTo') block to reach the branch where `char` could be falsy (if an implementation allowed it to not throw but return null/undefined)
