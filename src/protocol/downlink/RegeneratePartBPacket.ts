import { BoksPacketOptions } from '../_BoksPacketBase';
import { PayloadMapper, PayloadHexString } from '@/protocol/decorators';
import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Provisioning / Regeneration part B (0x21).
 */
export interface RegeneratePartBPacketProps extends AuthPacketProps {
  part: Uint8Array | string;
}

export class RegeneratePartBPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.RE_GENERATE_CODES_PART2;
  get opcode() {
    return RegeneratePartBPacket.opcode;
  }

  @PayloadHexString(8, 16)
  public accessor part!: string;

  constructor(props: RegeneratePartBPacketProps, raw?: Uint8Array) {
    super(props, raw);
    this.part = props.part as string;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): RegeneratePartBPacket {
    const data = PayloadMapper.parse<RegeneratePartBPacketProps>(
      RegeneratePartBPacket,
      payload,
      options
    );
    return new RegeneratePartBPacket(data, payload);
  }
}
