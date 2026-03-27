import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/decorators';

/**
 * Command to create a multi-use code.
 */
export interface CreateMultiUseCodePacketProps extends AuthPacketProps {
  pin: string;
}

export class CreateMultiUseCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.CREATE_MULTI_USE_CODE;
  get opcode() {
    return CreateMultiUseCodePacket.opcode;
  }

  @PayloadPinCode(8)
  public accessor pin!: string;

  constructor(props: CreateMultiUseCodePacketProps, rawPayload?: Uint8Array) {
    super(props, rawPayload);
    this.pin = props.pin;
  }

  static fromPayload(payload: Uint8Array): CreateMultiUseCodePacket {
    const data = PayloadMapper.parse<CreateMultiUseCodePacketProps>(
      CreateMultiUseCodePacket,
      payload
    );
    return new CreateMultiUseCodePacket(data, payload);
  }
}
