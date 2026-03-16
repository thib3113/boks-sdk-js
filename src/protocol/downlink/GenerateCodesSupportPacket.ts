import { PayloadMapper, PayloadSeed } from '@/protocol/decorators';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Command to trigger code generation in support mode.
 */
export class GenerateCodesSupportPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.GENERATE_CODES_SUPPORT;
  get opcode() {
    return GenerateCodesSupportPacket.opcode;
  }

  @PayloadSeed(0)
  public accessor seedStr!: string;

  constructor(seed: Uint8Array | string, rawPayload?: Uint8Array) {
    super(rawPayload);
    this.seedStr = seed as unknown as string;
  }

  static fromPayload(payload: Uint8Array): GenerateCodesSupportPacket {
    const data = PayloadMapper.parse(GenerateCodesSupportPacket, payload);
    return new GenerateCodesSupportPacket(data.seedStr, payload);
  }
}
