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

  constructor(configKey: string, pin: string) {
    super(configKey);
    this.pin = pin;
  }

  static fromPayload(payload: Uint8Array): MultiToSingleCodePacket {
    const data = PayloadMapper.parse(MultiToSingleCodePacket, payload);
    return new MultiToSingleCodePacket(data.configKey as string, data.pin as string);
  }
}
