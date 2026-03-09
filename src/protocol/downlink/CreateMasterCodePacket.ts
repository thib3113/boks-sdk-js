import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { validateMasterCodeIndex } from '@/utils/validation';
import { PayloadMapper, PayloadPinCode, PayloadConfigKey, PayloadUint8 } from '@/protocol/payload-mapper';

/**
 * Command to create a permanent master code at a specific index.
 */
export class CreateMasterCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.CREATE_MASTER_CODE;
  get opcode() {
    return CreateMasterCodePacket.opcode;
  }

  @PayloadConfigKey(0)
  public readonly configKeyStr: string;

  @PayloadPinCode(8)
  public readonly pin: string;

  @PayloadUint8(14)
  public readonly index: number;

  constructor(
    configKey: string,
    index: number,
    pin: string
  ) {
    super(configKey);
    validateMasterCodeIndex(index);
    this.configKeyStr = this.formatConfigKey(configKey);
    this.pin = this.formatPin(pin);
    this.index = index;
  }

  static fromPayload(payload: Uint8Array): CreateMasterCodePacket {
    // Legacy fallback: Pad payload with 0 if it is exactly 14 bytes long (missing index byte)
    let safePayload = payload;
    if (payload.length === 14) {
       safePayload = new Uint8Array(15);
       safePayload.set(payload);
    }
    const data = PayloadMapper.parse(CreateMasterCodePacket, safePayload);
    return new CreateMasterCodePacket(data.configKeyStr!, data.index || 0, data.pin!);
  }

  toPayload(): Uint8Array {
    return PayloadMapper.serialize(this);
  }
}
