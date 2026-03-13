import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/payload-mapper';

/**
 * Command to delete a multi-use code.
 */
export class DeleteMultiUseCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.DELETE_MULTI_USE_CODE;
  get opcode() {
    return DeleteMultiUseCodePacket.opcode;
  }

  @PayloadPinCode(8)
  public accessor pin!: string;

  constructor(props: { configKey: string; pin: string }, rawPayload?: Uint8Array) {
    super(props.configKey, rawPayload);
    this.pin = props.pin;
  }

  static fromPayload(payload: Uint8Array): DeleteMultiUseCodePacket {
    const data = PayloadMapper.parse(DeleteMultiUseCodePacket, payload);
    return new DeleteMultiUseCodePacket(
      { configKey: data.configKey as string, pin: data.pin as string },
      payload
    );
  }
}
