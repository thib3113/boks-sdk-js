import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/payload-mapper';

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

  constructor(props: SingleToMultiCodePacketProps, rawPayload?: Uint8Array) {
    super(props, rawPayload);
    this.pin = props.pin;
  }

  static fromPayload(payload: Uint8Array): SingleToMultiCodePacket {
    const data = PayloadMapper.parse<SingleToMultiCodePacketProps>(
      SingleToMultiCodePacket,
      payload
    );
    return new SingleToMultiCodePacket(data, payload);
  }
}
