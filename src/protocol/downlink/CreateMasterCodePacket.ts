import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { validateMasterCodeIndex } from '@/utils/validation';
import {
  PayloadMapper,
  PayloadPinCode,
  PayloadConfigKey,
  PayloadUint8
} from '@/protocol/payload-mapper';

export interface CreateMasterCodePacketProps {
  configKey: string;
  index: number;
  pin: string;
}

/**
 * Command to create a permanent master code at a specific index.
 */
export class CreateMasterCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.CREATE_MASTER_CODE;
  get opcode() {
    return CreateMasterCodePacket.opcode;
  }

  @PayloadConfigKey(0)
  public accessor configKeyStr: string;

  @PayloadPinCode(8)
  public accessor pin: string;

  @PayloadUint8(14)
  public accessor index: number;

  constructor(props: CreateMasterCodePacketProps) {
    super(props.configKey);
    this.configKeyStr = props.configKey ? props.configKey.toUpperCase() : props.configKey;
    this.pin = props.pin ? props.pin.toUpperCase() : props.pin;
    this.index = props.index;

    validateMasterCodeIndex(this.index);
    PayloadMapper.validate(this);
  }

  static fromPayload(payload: Uint8Array): CreateMasterCodePacket {
    let safePayload = payload;
    if (payload.length === 14) {
      safePayload = new Uint8Array(15);
      safePayload.set(payload);
    }
    const data = PayloadMapper.parse(CreateMasterCodePacket, safePayload);
    return new CreateMasterCodePacket({
      configKey: data.configKeyStr as string,
      index: (data.index as number) || 0,
      pin: data.pin as string
    });
  }

  toPayload(): Uint8Array {
    return PayloadMapper.serialize(this);
  }
}
