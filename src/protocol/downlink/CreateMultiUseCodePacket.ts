import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/payload-mapper';

/**
 * Command to create a multi-use code.
 */
export class CreateMultiUseCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.CREATE_MULTI_USE_CODE;
  get opcode() {
    return CreateMultiUseCodePacket.opcode;
  }

  @PayloadPinCode(8)
  public accessor pin!: string;

  constructor(props: { configKey: string; pin: string }, rawPayload?: Uint8Array) {
    super(props.configKey, rawPayload);
    this.pin = props.pin;
  }

  static fromPayload(payload: Uint8Array): CreateMultiUseCodePacket {
    const data = PayloadMapper.parse(CreateMultiUseCodePacket, payload);
    return new CreateMultiUseCodePacket(
      { configKey: data.configKey as string, pin: data.pin as string },
      payload
    );
  }
}
