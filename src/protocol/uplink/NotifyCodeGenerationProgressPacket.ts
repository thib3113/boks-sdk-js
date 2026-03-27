import { BoksPacketOptions } from '../_BoksPacketBase';
import { PayloadMapper, PayloadProgress } from '@/protocol/decorators';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Code generation progress.
 */
export class NotifyCodeGenerationProgressPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_CODE_GENERATION_PROGRESS;

  @PayloadProgress(0)
  public accessor progress!: number;

  constructor(progress: number, raw?: Uint8Array) {
    super(NotifyCodeGenerationProgressPacket.opcode, raw);
    this.progress = progress;
  }

  static fromRaw(
    payload: Uint8Array,
    options?: BoksPacketOptions
  ): NotifyCodeGenerationProgressPacket {
    const data = PayloadMapper.parse<NotifyCodeGenerationProgressPacket>(
      NotifyCodeGenerationProgressPacket,
      payload,
      options
    );
    return new NotifyCodeGenerationProgressPacket(data.progress, payload);
  }
}
