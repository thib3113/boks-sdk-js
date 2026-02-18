import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { hexToBytes } from '@/utils/converters';

/**
 * Command to trigger code generation in support mode.
 * (UNTESTED)
 */
export class GenerateCodesSupportPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.GENERATE_CODES_SUPPORT;
  get opcode() {
    return GenerateCodesSupportPacket.opcode;
  }

  constructor(public readonly seed: Uint8Array | string) {
    super();
  }

  toPayload(): Uint8Array {
    const seedBytes = typeof this.seed === 'string' ? hexToBytes(this.seed) : this.seed;
    if (seedBytes.length !== 32) throw new Error('Seed must be exactly 32 bytes');
    return seedBytes;
  }
}
