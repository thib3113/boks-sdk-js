import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/decorators';

/**
 * Command to delete a multi-use code.
 */
export interface DeleteMultiUseCodePacketProps extends AuthPacketProps {
  pin: string;
}

export class DeleteMultiUseCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.DELETE_MULTI_USE_CODE;
  get opcode() {
    return DeleteMultiUseCodePacket.opcode;
  }

  @PayloadPinCode(8)
  public accessor pin!: string;

  constructor(props: DeleteMultiUseCodePacketProps, raw?: Uint8Array) {
    super(props, raw);
    this.pin = props.pin;
  }

  static fromRaw(payload: Uint8Array): DeleteMultiUseCodePacket {
    const data = PayloadMapper.parse<DeleteMultiUseCodePacketProps>(
      DeleteMultiUseCodePacket,
      payload
    );
    return new DeleteMultiUseCodePacket(data, payload);
  }
}
