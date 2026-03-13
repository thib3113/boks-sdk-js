import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/payload-mapper';

/**
 * Command to convert a Single-Use code to Multi-Use.
 */
export class SingleToMultiCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.SINGLE_USE_CODE_TO_MULTI;
  get opcode() {
    return SingleToMultiCodePacket.opcode;
  }

  @PayloadPinCode(8)
  public accessor pin!: string;

  constructor(props: { configKey: string; pin: string }, rawPayload?: Uint8Array) {
    super(props.configKey, rawPayload);
    this.pin = props.pin;
  }

  static fromPayload(payload: Uint8Array): SingleToMultiCodePacket {
    const data = PayloadMapper.parse(SingleToMultiCodePacket, payload);
    return new SingleToMultiCodePacket(
      { configKey: data.configKey as string, pin: data.pin as string },
      payload
    );
  }
}
