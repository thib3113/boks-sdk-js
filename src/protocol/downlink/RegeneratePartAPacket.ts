import { PayloadMapper, PayloadByteArray } from '@/protocol/payload-mapper';
import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { writeConfigKeyToBuffer } from '@/utils/converters';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Provisioning / Regeneration part A (0x20).
 */
export interface RegeneratePartAPacketProps extends AuthPacketProps {
  part: Uint8Array;
}

export class RegeneratePartAPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.RE_GENERATE_CODES_PART1;
  get opcode() {
    return RegeneratePartAPacket.opcode;
  }

  @PayloadByteArray(8, 16)
  public accessor part!: Uint8Array;

  constructor(props: RegeneratePartAPacketProps, rawPayload?: Uint8Array) {
    super(props, rawPayload);
    this.part = props.part;
    if (!props.part || props.part.length !== 16) {
      throw new BoksProtocolError(BoksProtocolErrorId.INVALID_VALUE, undefined, {
        received: props.part.length,
        expected: 16,
        field: 'props.part'
      });
    }
  }

  static fromPayload(payload: Uint8Array): RegeneratePartAPacket {
    const data = PayloadMapper.parse<RegeneratePartAPacketProps>(RegeneratePartAPacket, payload);
    return new RegeneratePartAPacket(data, payload);
  }

  toPayload() {
    const payload = new Uint8Array(8 + 16);
    writeConfigKeyToBuffer(payload, 0, this.configKey);
    payload.set(this.part, 8);
    return payload;
  }
}
