import { PayloadMapper, PayloadHexString } from '@/protocol/payload-mapper';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { hexToBytes } from '@/utils/converters';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Command to trigger initial code generation from a seed.
 */
export class GenerateCodesPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.GENERATE_CODES;
  get opcode() {
    return GenerateCodesPacket.opcode;
  }

  @PayloadHexString(0, 32)
  public accessor seedStr!: string;

  constructor(seed: Uint8Array | string, rawPayload?: Uint8Array) {
    super(rawPayload);
    this.seedStr = this.formatSeed(seed);
  }

  static fromPayload(payload: Uint8Array): GenerateCodesPacket {
    const data = PayloadMapper.parse(GenerateCodesPacket, payload);
    return new GenerateCodesPacket(data.seedStr as string, payload);
  }

  toPayload(): Uint8Array {
    const seedBytes = hexToBytes(this.seedStr);
    if (seedBytes.length !== 32) {
      throw new Error('Seed must be exactly 32 bytes');
    }
    return seedBytes;
  }
}
