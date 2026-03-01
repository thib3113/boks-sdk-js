import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes } from '@/utils/converters';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Provisioning / Regeneration part B (0x21).
 */
export class RegeneratePartBPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.RE_GENERATE_CODES_PART2;
  get opcode() {
    return RegeneratePartBPacket.opcode;
  }

  constructor(
    configKey: string,
    public readonly part: Uint8Array
  ) {
    super(configKey);
    if (part.length !== 16) {
      throw new BoksProtocolError(BoksProtocolErrorId.INVALID_VALUE, undefined, {
        received: part.length,
        expected: 16,
        field: 'part'
      });
    }
  }

  static fromPayload(payload: Uint8Array): RegeneratePartBPacket {
    const configKey = AuthPacket.extractConfigKey(payload);
    const part = payload.subarray(8, 24);
    return new RegeneratePartBPacket(configKey, part);
  }

  toPayload() {
    const payload = new Uint8Array(8 + 16);
    payload.set(stringToBytes(this.configKey), 0);
    payload.set(this.part, 8);
    return payload;
  }
}
