import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Code generation succeeded.
 */
export class NotifyCodeGenerationSuccessPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_CODE_GENERATION_SUCCESS;

  constructor(rawPayload?: Uint8Array) {
    super(NotifyCodeGenerationSuccessPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyCodeGenerationSuccessPacket {
    return new NotifyCodeGenerationSuccessPacket(payload);
  }
}
