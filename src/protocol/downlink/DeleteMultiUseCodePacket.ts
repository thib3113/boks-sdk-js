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

  constructor(configKey: string, pin: string) {
    super(configKey);
    this.pin = pin;
  }

  static fromPayload(payload: Uint8Array): DeleteMultiUseCodePacket {
    const data = PayloadMapper.parse(DeleteMultiUseCodePacket, payload);
    return new DeleteMultiUseCodePacket(data.configKey as string, data.pin as string);
  }
}
