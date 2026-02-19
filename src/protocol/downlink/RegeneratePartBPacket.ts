import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes, bytesToString } from '@/utils/converters';

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
    if (part.length !== 16) throw new Error('Token part must be exactly 16 bytes');
  }

  static fromPayload(payload: Uint8Array): RegeneratePartBPacket {
    const configKey = bytesToString(payload.slice(0, 8));
    const part = payload.slice(8, 24);
    return new RegeneratePartBPacket(configKey, part);
  }

  toPayload() {
    const payload = new Uint8Array(8 + 16);
    payload.set(stringToBytes(this.configKey), 0);
    payload.set(this.part, 8);
    return payload;
  }
}
