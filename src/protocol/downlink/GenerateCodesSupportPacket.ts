import { BoksPacketOptions } from '../_BoksPacketBase';
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
  public accessor seed!: string;

  constructor(seed: Uint8Array | string, raw?: Uint8Array) {
    super(raw);
    this.seed = seed as string;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): GenerateCodesSupportPacket {
    const data = PayloadMapper.parse<GenerateCodesSupportPacket>(
      GenerateCodesSupportPacket, payload, options);
    return new GenerateCodesSupportPacket(data.seed, payload);
  }
}
