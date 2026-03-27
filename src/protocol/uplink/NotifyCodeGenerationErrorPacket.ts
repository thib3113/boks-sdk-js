import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Code generation error.
 */
export class NotifyCodeGenerationErrorPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_CODE_GENERATION_ERROR;

  constructor(raw?: Uint8Array) {
    super(NotifyCodeGenerationErrorPacket.opcode, raw);
  }

  static fromRaw(
    payload: Uint8Array,
    _options?: BoksPacketOptions
  ): NotifyCodeGenerationErrorPacket {
    return new NotifyCodeGenerationErrorPacket(payload);
  }
}
