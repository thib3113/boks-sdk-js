import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/payload-mapper';

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

  constructor(props: MultiToSingleCodePacketProps, rawPayload?: Uint8Array) {
    super(props, rawPayload);
    this.pin = props.pin;
  }

  static fromPayload(payload: Uint8Array): MultiToSingleCodePacket {
    const data = PayloadMapper.parse<MultiToSingleCodePacketProps>(
      MultiToSingleCodePacket,
      payload
    );
    return new MultiToSingleCodePacket(data, payload);
  }
}
