import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToString } from '@/utils/converters';

/**
 * Log: Successful BLE code usage.
 */
export class CodeBleValidHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_CODE_BLE_VALID;

  constructor(
    age: number = 0,
    public readonly code: string = '',
    public readonly connectedMac: string = '',
    rawPayload?: Uint8Array
  ) {
    super(CodeBleValidHistoryPacket.opcode, age, rawPayload);
  }

  static fromPayload(payload: Uint8Array): CodeBleValidHistoryPacket {
    let age = 0;
    let code = '';
    let connectedMac = '';

    if (payload.length >= 3) {
      age = (payload[0] << 16) | (payload[1] << 8) | payload[2];
    }

    const offset = 3;
    if (payload.length >= offset + 6) {
      code = bytesToString(payload.slice(offset, offset + 6));
    }
    // Offset 3+6+2(padding) = 11. MAC starts at 11, length 6.
    if (payload.length >= 17) {
      const macBytes = payload.slice(11, 17);
      // Reverse for Big Endian display (Firmware sends Little Endian)
      connectedMac = Array.from(macBytes)
        .reverse()
        .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
        .join(':');
    }
    return new CodeBleValidHistoryPacket(age, code, connectedMac, payload);
  }

  toJSON() {
    return {
      ...this,
      code: '******'
    };
  }
}
