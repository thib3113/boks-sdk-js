import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { writeConfigKeyToBuffer } from '@/utils/converters';
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

  public readonly part: Uint8Array;

  constructor(props: { configKey: string; part: Uint8Array }, rawPayload?: Uint8Array) {
    super(props.configKey, rawPayload);
    this.part = props.part;
    if (props.part.length !== 16) {
      throw new BoksProtocolError(BoksProtocolErrorId.INVALID_VALUE, undefined, {
        received: props.part.length,
        expected: 16,
        field: 'props.part'
      });
    }
  }

  static fromPayload(payload: Uint8Array): RegeneratePartBPacket {
    const configKey = AuthPacket.extractConfigKey(payload);
    const part = payload.subarray(8, 24);
    return new RegeneratePartBPacket({ configKey: configKey, part: part }, payload);
  }

  toPayload() {
    const payload = new Uint8Array(8 + 16);
    writeConfigKeyToBuffer(payload, 0, this.configKey);
    payload.set(this.part, 8);
    return payload;
  }
}
