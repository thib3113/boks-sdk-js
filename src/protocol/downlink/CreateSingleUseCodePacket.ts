import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/payload-mapper';

/**
 * Command to create a single-use code.
 */
export class CreateSingleUseCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.CREATE_SINGLE_USE_CODE;
  get opcode() {
    return CreateSingleUseCodePacket.opcode;
  }

  @PayloadPinCode(8)
  public accessor pin!: string;

  constructor(props: { configKey: string; pin: string }, rawPayload?: Uint8Array) {
    super(props.configKey, rawPayload);
    this.pin = props.pin;
  }

  static fromPayload(payload: Uint8Array): CreateSingleUseCodePacket {
    const data = PayloadMapper.parse(CreateSingleUseCodePacket, payload);
    return new CreateSingleUseCodePacket(
      { configKey: data.configKey as string, pin: data.pin as string },
      payload
    );
  }
}
