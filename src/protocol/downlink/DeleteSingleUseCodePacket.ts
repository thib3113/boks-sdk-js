import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/payload-mapper';

/**
 * Command to delete a single-use code by value.
 */
export class DeleteSingleUseCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.DELETE_SINGLE_USE_CODE;
  get opcode() {
    return DeleteSingleUseCodePacket.opcode;
  }

  @PayloadPinCode(8)
  public accessor pin!: string;

  constructor(props: { configKey: string; pin: string }, rawPayload?: Uint8Array) {
    super(props.configKey, rawPayload);
    this.pin = props.pin;
  }

  static fromPayload(payload: Uint8Array): DeleteSingleUseCodePacket {
    const data = PayloadMapper.parse(DeleteSingleUseCodePacket, payload);
    return new DeleteSingleUseCodePacket(
      { configKey: data.configKey as string, pin: data.pin as string },
      payload
    );
  }
}
