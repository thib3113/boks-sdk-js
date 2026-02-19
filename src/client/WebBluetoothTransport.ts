import { BoksTransport } from './transport';
import { BoksClientError, BoksClientErrorId } from '@/errors/BoksClientError';
import { BOKS_UUIDS } from '@/protocol/constants';

/**
 * Implementation of BoksTransport using the Web Bluetooth API.
 */
export class WebBluetoothTransport implements BoksTransport {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private writeChar: BluetoothRemoteGATTCharacteristic | null = null;
  private notifyChar: BluetoothRemoteGATTCharacteristic | null = null;

  constructor(device?: BluetoothDevice) {
    if (device) this.device = device;
  }

  async connect(): Promise<void> {
    if (!this.device && (typeof navigator === 'undefined' || !navigator.bluetooth)) {
      throw new BoksClientError(
        BoksClientErrorId.WEB_BLUETOOTH_NOT_SUPPORTED,
        'Web Bluetooth is not supported in this environment.'
      );
    }

    try {
      if (!this.device) {
        // We checked for navigator.bluetooth above
        this.device = await navigator.bluetooth.requestDevice({
          filters: [{ services: [BOKS_UUIDS.SERVICE] }],
          optionalServices: [
            BOKS_UUIDS.SERVICE,
            BOKS_UUIDS.BATTERY_SERVICE,
            BOKS_UUIDS.DEVICE_INFO_SERVICE
          ]
        });
      }

      if (!this.device?.gatt) {
        throw new BoksClientError(
          BoksClientErrorId.CONNECTION_FAILED,
          'GATT Server not available.'
        );
      }

      this.server = await this.device.gatt.connect();
      const service = await this.server.getPrimaryService(BOKS_UUIDS.SERVICE);

      this.writeChar = await service.getCharacteristic(BOKS_UUIDS.WRITE);
      this.notifyChar = await service.getCharacteristic(BOKS_UUIDS.NOTIFY);
    } catch (error) {
      if (error instanceof BoksClientError) throw error;
      throw new BoksClientError(
        BoksClientErrorId.CONNECTION_FAILED,
        'Failed to connect to Boks device',
        error
      );
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.server?.connected) {
        this.server.disconnect();
      }
    } catch (error) {
      throw new BoksClientError(BoksClientErrorId.DISCONNECT_FAILED, 'Failed to disconnect', error);
    }
  }

  async write(data: Uint8Array): Promise<void> {
    if (!this.writeChar) {
      throw new BoksClientError(
        BoksClientErrorId.NOT_CONNECTED,
        'Not connected (Write characteristic missing).'
      );
    }
    try {
      await this.writeChar.writeValueWithResponse(data as unknown as BufferSource);
    } catch (error) {
      throw new BoksClientError(
        BoksClientErrorId.WRITE_FAILED,
        'Failed to write to Boks device',
        error
      );
    }
  }

  async read(uuid: string): Promise<Uint8Array> {
    if (!this.server?.connected) {
      throw new BoksClientError(BoksClientErrorId.NOT_CONNECTED, 'Not connected to GATT server.');
    }

    try {
      // First try to find the characteristic in the primary services we requested
      const services = await this.server.getPrimaryServices();
      for (const service of services) {
        try {
          const char = await service.getCharacteristic(uuid);
          const value = await char.readValue();
          return new Uint8Array(value.buffer);
        } catch {
          // Ignore error and try next service
        }
      }
      throw new Error(`Characteristic ${uuid} not found in any visible service.`);
    } catch (error) {
      throw new BoksClientError(
        BoksClientErrorId.PARSE_ERROR,
        `Failed to read characteristic ${uuid}`,
        error
      );
    }
  }

  async subscribe(callback: (data: Uint8Array) => void): Promise<void> {
    if (!this.notifyChar) {
      throw new BoksClientError(
        BoksClientErrorId.NOT_CONNECTED,
        'Not connected (Notify characteristic missing).'
      );
    }

    try {
      await this.notifyChar.startNotifications();
      this.notifyChar.addEventListener('characteristicvaluechanged', (event: Event) => {
        const char = event.target as BluetoothRemoteGATTCharacteristic;
        const value = char.value;
        if (value) {
          callback(new Uint8Array(value.buffer));
        }
      });
    } catch (error) {
      throw new BoksClientError(
        BoksClientErrorId.SUBSCRIBE_FAILED,
        'Failed to subscribe to notifications',
        error
      );
    }
  }
}
