import { BoksTransport } from './transport';
import { BoksClientError, BoksClientErrorId } from '@/errors/BoksClientError';

const BOKS_SERVICE_UUID = 'a7630001-f491-4f21-95ea-846ba586e361';
const BOKS_WRITE_CHAR_UUID = 'a7630002-f491-4f21-95ea-846ba586e361';
const BOKS_NOTIFY_CHAR_UUID = 'a7630003-f491-4f21-95ea-846ba586e361';

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
    if (!navigator?.bluetooth) {
      throw new BoksClientError(
        BoksClientErrorId.WEB_BLUETOOTH_NOT_SUPPORTED,
        'Web Bluetooth is not supported in this environment.'
      );
    }

    try {
      if (!this.device) {
        this.device = await navigator.bluetooth.requestDevice({
          filters: [{ services: [BOKS_SERVICE_UUID] }],
          optionalServices: [BOKS_SERVICE_UUID]
        });
      }

      if (!this.device.gatt) {
        throw new BoksClientError(
          BoksClientErrorId.CONNECTION_FAILED,
          'GATT Server not available.'
        );
      }

      this.server = await this.device.gatt.connect();
      const service = await this.server.getPrimaryService(BOKS_SERVICE_UUID);

      this.writeChar = await service.getCharacteristic(BOKS_WRITE_CHAR_UUID);
      this.notifyChar = await service.getCharacteristic(BOKS_NOTIFY_CHAR_UUID);
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
      if (this.server && this.server.connected) {
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
      await this.writeChar.writeValueWithResponse(data);
    } catch (error) {
      throw new BoksClientError(
        BoksClientErrorId.WRITE_FAILED,
        'Failed to write to Boks device',
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

