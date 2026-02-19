import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification of active code counts.
 */
export class NotifyCodesCountPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_CODES_COUNT;

  constructor(
    public readonly masterCount: number = 0,
    public readonly otherCount: number = 0,
    rawPayload?: Uint8Array
  ) {
    super(NotifyCodesCountPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyCodesCountPacket {
    let masterCount = 0;
    let otherCount = 0;
    if (payload.length >= 4) {
      const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
      masterCount = view.getUint16(0, false);
      otherCount = view.getUint16(2, false);
    }
    return new NotifyCodesCountPacket(masterCount, otherCount, payload);
  }
}
