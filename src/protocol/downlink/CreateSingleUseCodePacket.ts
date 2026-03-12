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

  constructor(configKey: string, pin: string) {
    super(configKey);
    this.pin = pin;
  }

  static fromPayload(payload: Uint8Array): CreateSingleUseCodePacket {
    const data = PayloadMapper.parse(CreateSingleUseCodePacket, payload);
    return new CreateSingleUseCodePacket(data.configKey as string, data.pin as string);
  }
}
