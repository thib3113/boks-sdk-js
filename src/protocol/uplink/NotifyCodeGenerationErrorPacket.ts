import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Code generation error.
 */
export class NotifyCodeGenerationErrorPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_CODE_GENERATION_ERROR;
  constructor() {
    super(NotifyCodeGenerationErrorPacket.opcode);
  }
  parse() {}
}
