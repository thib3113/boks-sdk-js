import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToString } from '@/utils/converters';

/**
 * Log: Invalid BLE code usage.
 */
export class CodeBleInvalidHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_CODE_BLE_INVALID;
  public code: string = '';
  public connectedMac: string = '';

  constructor() {
    super(CodeBleInvalidHistoryPacket.opcode);
  }

  parse(payload: Uint8Array): void {
    const offset = this.parseHistoryHeader(payload);
    if (payload.length >= offset + 6) {
      this.code = bytesToString(payload.slice(offset, offset + 6));
    }
    // Offset 3+6+2(padding) = 11. MAC starts at 11, length 6.
    if (payload.length >= 17) {
      const macBytes = payload.slice(11, 17);
      // Reverse for Big Endian display (Firmware sends Little Endian)
      this.connectedMac = Array.from(macBytes)
        .reverse()
        .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
        .join(':');
    }
  }
}
