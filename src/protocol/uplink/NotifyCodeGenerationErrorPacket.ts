import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Code generation error.
 */
export class NotifyCodeGenerationErrorPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_CODE_GENERATION_ERROR;

  constructor(rawPayload?: Uint8Array) {
    super(NotifyCodeGenerationErrorPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyCodeGenerationErrorPacket {
    return new NotifyCodeGenerationErrorPacket(payload);
  }
}
