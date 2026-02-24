/**
 * Interface abstracting the underlying BLE transport layer.
 * Allows the BoksClient to be agnostic of the environment (Web Bluetooth, Cordova, Node.js, etc.).
 */
export interface BoksTransport {
  /**
   * Connects to the device.
   */
  connect(): Promise<void>;

  /**
   * Disconnects from the device.
   */
  disconnect(): Promise<void>;

  /**
   * Sends data to the Boks device (Write Characteristic).
   * @param data The raw bytes to send.
   */
  write(data: Uint8Array): Promise<void>;

  /**
   * Reads data from a specific characteristic.
   * @param uuid The characteristic UUID to read.
   */
  read(uuid: string): Promise<Uint8Array>;

  /**
   * Subscribes to notifications from the Boks device (Notify Characteristic).
   * @param callback Function called when data is received.
   */
  subscribe(callback: (data: Uint8Array) => void): Promise<void>;

  /**
   * Subscribes to notifications from a specific characteristic.
   * @param uuid The characteristic UUID to subscribe to.
   * @param callback Function called when data is received.
   */
  subscribeTo(uuid: string, callback: (data: Uint8Array) => void): Promise<void>;
}
