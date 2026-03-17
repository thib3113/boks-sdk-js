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
  public accessor seedStr!: string;

  constructor(seed: Uint8Array | string, rawPayload?: Uint8Array) {
    super(rawPayload);
    this.seedStr = seed as unknown as string;
  }

  static fromPayload(payload: Uint8Array): GenerateCodesPacket {
    const data = PayloadMapper.parse(GenerateCodesPacket, payload);
    return new GenerateCodesPacket(data.seedStr, payload);
  }
}
