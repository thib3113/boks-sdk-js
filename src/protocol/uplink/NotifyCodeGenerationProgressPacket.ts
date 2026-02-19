import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Code generation progress.
 */
export class NotifyCodeGenerationProgressPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_CODE_GENERATION_PROGRESS;
  public progress: number = 0;

  constructor() {
    super(NotifyCodeGenerationProgressPacket.opcode);
  }

  parse(payload: Uint8Array) {
    super.parse(payload);
    if (payload.length > 0) {
      this.progress = payload[0];
    }
  }

  static fromPayload(payload: Uint8Array): NotifyCodeGenerationProgressPacket {
    const packet = new NotifyCodeGenerationProgressPacket();
    packet.parse(payload);
    return packet;
  }
}
