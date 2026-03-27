import { PayloadMapper, PayloadHexString } from '@/protocol/decorators';
import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Provisioning / Regeneration part A (0x20).
 */
export interface RegeneratePartAPacketProps extends AuthPacketProps {
  part: Uint8Array | string;
}

export class RegeneratePartAPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.RE_GENERATE_CODES_PART1;
  get opcode() {
    return RegeneratePartAPacket.opcode;
  }

  @PayloadHexString(8, 16)
  public accessor part!: string;

  constructor(props: RegeneratePartAPacketProps, rawPayload?: Uint8Array) {
    super(props, rawPayload);
    this.part = props.part as string;
  }

  static fromPayload(payload: Uint8Array): RegeneratePartAPacket {
    const data = PayloadMapper.parse<RegeneratePartAPacketProps>(RegeneratePartAPacket, payload);
    return new RegeneratePartAPacket(data, payload);
  }
}
