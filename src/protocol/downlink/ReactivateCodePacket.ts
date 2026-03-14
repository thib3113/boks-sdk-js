import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/payload-mapper';

/**
 * Command to reactivate a disabled code.
 */
export class ReactivateCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.REACTIVATE_CODE;
  get opcode() {
    return ReactivateCodePacket.opcode;
  }

  @PayloadPinCode(8)
  public accessor pin!: string;

  constructor(props: { configKey: string; pin: string }, rawPayload?: Uint8Array) {
    super(props.configKey, rawPayload);
    this.pin = props.pin;
  }

  static fromPayload(payload: Uint8Array): ReactivateCodePacket {
    const data = PayloadMapper.parse(ReactivateCodePacket, payload);
    return new ReactivateCodePacket(
      { configKey: data.configKey as string, pin: data.pin as string },
      payload
    );
  }
}
