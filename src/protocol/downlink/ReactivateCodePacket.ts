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

  constructor(configKey: string, pin: string) {
    super(configKey);
    this.pin = this.formatPin(pin);
  }

  static fromPayload(payload: Uint8Array): ReactivateCodePacket {
    const data = PayloadMapper.parse(ReactivateCodePacket, payload);
    return new ReactivateCodePacket(data.configKey as string, data.pin as string);
  }
}
