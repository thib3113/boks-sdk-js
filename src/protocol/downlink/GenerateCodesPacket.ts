import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { hexToBytes } from '@/utils/converters';
import { validateSeed } from '@/utils/validation';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Command to trigger initial code generation from a seed.
 */
export class GenerateCodesPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.GENERATE_CODES;
  get opcode() {
    return GenerateCodesPacket.opcode;
  }

  constructor(public readonly seed: Uint8Array | string) {
    super();
    validateSeed(seed);
  }

  static fromPayload(payload: Uint8Array): GenerateCodesPacket {
    return new GenerateCodesPacket(payload);
  }

  toPayload(): Uint8Array {
    const seedBytes = typeof this.seed === 'string' ? hexToBytes(this.seed) : this.seed;
    if (seedBytes.length !== 32) throw new Error('Seed must be exactly 32 bytes');
    return seedBytes;
  }

  toJSON() {
    return {
      ...this,
      rawPayload: {},
      seed: '[REDACTED]'
    };
  }
}
