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

  constructor(configKey: string, pin: string) {
    super(configKey);
    this.pin = pin;
  }

  static fromPayload(payload: Uint8Array): CreateMultiUseCodePacket {
    const data = PayloadMapper.parse(CreateMultiUseCodePacket, payload);
    return new CreateMultiUseCodePacket(data.configKey as string, data.pin as string);
  }
}
