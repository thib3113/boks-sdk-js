import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Code generation progress.
 */
export class NotifyCodeGenerationProgressPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_CODE_GENERATION_PROGRESS;

  constructor(
    public readonly progress: number = 0,
    rawPayload?: Uint8Array
  ) {
    super(NotifyCodeGenerationProgressPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyCodeGenerationProgressPacket {
    let progress = 0;
    if (payload.length > 0) {
      progress = payload[0];
    }
    return new NotifyCodeGenerationProgressPacket(progress, payload);
  }
}
