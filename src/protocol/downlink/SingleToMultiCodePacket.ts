import { BoksPacketOptions } from '../_BoksPacketBase';
import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/decorators';

/**
 * Command to convert a Single-Use code to Multi-Use.
 */
export interface SingleToMultiCodePacketProps extends AuthPacketProps {
  pin: string;
}

export class SingleToMultiCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.SINGLE_USE_CODE_TO_MULTI;
  get opcode() {
    return SingleToMultiCodePacket.opcode;
  }

  @PayloadPinCode(8)
  public accessor pin!: string;

  constructor(props: SingleToMultiCodePacketProps, raw?: Uint8Array) {
    super(props, raw);
    this.pin = props.pin;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): SingleToMultiCodePacket {
    const data = PayloadMapper.parse<SingleToMultiCodePacketProps>(
      SingleToMultiCodePacket, payload, options);
    return new SingleToMultiCodePacket(data, payload);
  }
}
