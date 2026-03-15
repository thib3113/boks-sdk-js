import { PayloadMapper, PayloadSeed } from '@/protocol/payload-mapper';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { hexToBytes } from '@/utils/converters';

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
  public accessor seed!: string;

  constructor(seed: Uint8Array | string, rawPayload?: Uint8Array) {
    super(rawPayload);
    this.seed = seed as unknown as string;
  }

  static fromPayload(payload: Uint8Array): GenerateCodesSupportPacket {
    const data = PayloadMapper.parse(GenerateCodesSupportPacket, payload);
    return new GenerateCodesSupportPacket(data.seed as string, payload);
  }

  toPayload(): Uint8Array {
    const seedBytes = typeof this.seed === 'string' ? hexToBytes(this.seed) : this.seed;

    return seedBytes;
  }
}
