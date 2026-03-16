import { PayloadMapper, PayloadUint8 } from '@/protocol/decorators';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Code generation progress.
 */
export class NotifyCodeGenerationProgressPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_CODE_GENERATION_PROGRESS;

  @PayloadUint8(0)
  public accessor progress!: number;

  constructor(progress: number, rawPayload?: Uint8Array) {
    super(NotifyCodeGenerationProgressPacket.opcode, rawPayload);
    this.progress = progress;
  }

  static fromPayload(payload: Uint8Array): NotifyCodeGenerationProgressPacket {
    const data = PayloadMapper.parse<Record<string, unknown>>(
      NotifyCodeGenerationProgressPacket,
      payload
    );
    return new NotifyCodeGenerationProgressPacket(data.progress, payload);
  }
}
