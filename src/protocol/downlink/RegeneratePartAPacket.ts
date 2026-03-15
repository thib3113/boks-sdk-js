import { PayloadMapper, PayloadByteArray } from '@/protocol/payload-mapper';
import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';

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
  }

  static fromPayload(payload: Uint8Array): RegeneratePartAPacket {
    const data = PayloadMapper.parse<RegeneratePartAPacketProps>(RegeneratePartAPacket, payload);
    return new RegeneratePartAPacket(data, payload);
  }
}
