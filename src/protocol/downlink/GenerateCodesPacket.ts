import { BoksPacketOptions } from '../_BoksPacketBase';
import { PayloadMapper, PayloadSeed } from '@/protocol/decorators';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Command to trigger initial code generation from a seed.
 */
export class GenerateCodesPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.GENERATE_CODES;
  get opcode() {
    return GenerateCodesPacket.opcode;
  }

  @PayloadSeed(0)
  public accessor seed!: string;

  constructor(seed: Uint8Array | string, raw?: Uint8Array) {
    super(raw);
    this.seed = seed as string;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): GenerateCodesPacket {
    const data = PayloadMapper.parse<GenerateCodesPacket>(GenerateCodesPacket, payload, options);
    return new GenerateCodesPacket(data.seed, payload);
  }
}
