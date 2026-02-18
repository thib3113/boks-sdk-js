import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification of active code counts.
 */
export class NotifyCodesCountPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_CODES_COUNT;
  public masterCount: number = 0;
  public otherCount: number = 0;

  constructor() {
    super(NotifyCodesCountPacket.opcode);
  }

  parse(payload: Uint8Array) {
    super.parse(payload);
    if (payload.length >= 4) {
      const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
      this.masterCount = view.getUint16(0, false);
      this.otherCount = view.getUint16(2, false);
    }
  }
}


