import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Scale tare empty OK.
 */
export class NotifyScaleTareEmptyOkPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_TARE_EMPTY_OK;

  constructor(rawPayload?: Uint8Array) {
    super(NotifyScaleTareEmptyOkPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyScaleTareEmptyOkPacket {
    return new NotifyScaleTareEmptyOkPacket(payload);
  }
}
