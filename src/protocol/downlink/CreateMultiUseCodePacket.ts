import { BoksPacketOptions } from '../_BoksPacketBase';
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

  constructor(props: CreateMultiUseCodePacketProps, raw?: Uint8Array) {
    super(props, raw);
    this.pin = props.pin;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): CreateMultiUseCodePacket {
    const data = PayloadMapper.parse<CreateMultiUseCodePacketProps>(
      CreateMultiUseCodePacket,
      payload,
      options
    );
    return new CreateMultiUseCodePacket(data, payload);
  }
}
