import { BoksPacketOptions } from '../_BoksPacketBase';
import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/decorators';

/**
 * Command to delete a single-use code by value.
 */
export interface DeleteSingleUseCodePacketProps extends AuthPacketProps {
  pin: string;
}

export class DeleteSingleUseCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.DELETE_SINGLE_USE_CODE;
  get opcode() {
    return DeleteSingleUseCodePacket.opcode;
  }

  @PayloadPinCode(8)
  public accessor pin!: string;

  constructor(props: DeleteSingleUseCodePacketProps, raw?: Uint8Array) {
    super(props, raw);
    this.pin = props.pin;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): DeleteSingleUseCodePacket {
    const data = PayloadMapper.parse<DeleteSingleUseCodePacketProps>(
      DeleteSingleUseCodePacket,
      payload,
      options
    );
    return new DeleteSingleUseCodePacket(data, payload);
  }
}
