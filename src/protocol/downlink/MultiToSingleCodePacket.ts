import { BoksPacketOptions } from '../_BoksPacketBase';
import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/decorators';

/**
 * Command to convert a Multi-Use code to Single-Use.
 */
export interface MultiToSingleCodePacketProps extends AuthPacketProps {
  pin: string;
}

export class MultiToSingleCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.MULTI_CODE_TO_SINGLE_USE;
  get opcode() {
    return MultiToSingleCodePacket.opcode;
  }

  @PayloadPinCode(8)
  public accessor pin!: string;

  constructor(props: MultiToSingleCodePacketProps, raw?: Uint8Array) {
    super(props, raw);
    this.pin = props.pin;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): MultiToSingleCodePacket {
    const data = PayloadMapper.parse<MultiToSingleCodePacketProps>(
      MultiToSingleCodePacket,
      payload,
      options
    );
    return new MultiToSingleCodePacket(data, payload);
  }
}
