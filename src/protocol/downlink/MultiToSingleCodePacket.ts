import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/payload-mapper';

/**
 * Command to convert a Multi-Use code to Single-Use.
 */
export class MultiToSingleCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.MULTI_CODE_TO_SINGLE_USE;
  get opcode() {
    return MultiToSingleCodePacket.opcode;
  }

  @PayloadPinCode(8)
  public accessor pin!: string;

  constructor(props: { configKey: string; pin: string }, rawPayload?: Uint8Array) {
    super(props.configKey, rawPayload);
    this.pin = props.pin;
  }

  static fromPayload(payload: Uint8Array): MultiToSingleCodePacket {
    const data = PayloadMapper.parse(MultiToSingleCodePacket, payload);
    return new MultiToSingleCodePacket(
      { configKey: data.configKey as string, pin: data.pin as string },
      payload
    );
  }
}
