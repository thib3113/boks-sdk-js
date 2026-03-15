import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/payload-mapper';

/**
 * Command to create a single-use code.
 */
export interface CreateSingleUseCodePacketProps extends AuthPacketProps {
  pin: string;
}

export class CreateSingleUseCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.CREATE_SINGLE_USE_CODE;
  get opcode() {
    return CreateSingleUseCodePacket.opcode;
  }

  @PayloadPinCode(8)
  public accessor pin!: string;

  constructor(props: CreateSingleUseCodePacketProps, rawPayload?: Uint8Array) {
    super(props, rawPayload);
    this.pin = props.pin;
  }

  static fromPayload(payload: Uint8Array): CreateSingleUseCodePacket {
    const data = PayloadMapper.parse(CreateSingleUseCodePacket, payload);
    return new CreateSingleUseCodePacket(
      data as unknown as CreateSingleUseCodePacketProps,
      payload
    );
  }
}
