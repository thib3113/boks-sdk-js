import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes } from '@/utils/converters';

/**
 * Provisioning / Regeneration part A (0x20).
 */
export class RegeneratePartAPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.RE_GENERATE_CODES_PART1;
  get opcode() {
    return RegeneratePartAPacket.opcode;
  }

  constructor(
    configKey: string,
    public readonly part: Uint8Array
  ) {
    super(configKey);
    if (part.length !== 16) throw new Error('Token part must be exactly 16 bytes');
  }

  toPayload() {
    const payload = new Uint8Array(8 + 16);
    payload.set(stringToBytes(this.configKey), 0);
    payload.set(this.part, 8);
    return payload;
  }
}
