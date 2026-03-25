import { BoksPacketOptions } from '../_BoksPacketBase';
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

  constructor(props: RegeneratePartAPacketProps, raw?: Uint8Array) {
    super(props, raw);
    this.part = props.part as string;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): RegeneratePartAPacket {
    const data = PayloadMapper.parse<RegeneratePartAPacketProps>(
      RegeneratePartAPacket,
      payload,
      options
    );
    return new RegeneratePartAPacket(data, payload);
  }
}
