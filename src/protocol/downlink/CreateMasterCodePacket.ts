import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode, PayloadMasterCodeIndex } from '@/protocol/payload-mapper';

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

  @PayloadPinCode(8)
  public accessor pin!: string;

  @PayloadMasterCodeIndex(14)
  public accessor index!: number;

  constructor(props: CreateMasterCodePacketProps) {
    super(props.configKey);
    this.pin = props.pin;
    this.index = props.index;
  }

  static fromPayload(payload: Uint8Array): CreateMasterCodePacket {
    let safePayload = payload;
    if (payload.length === 14) {
      safePayload = new Uint8Array(15);
      safePayload.set(payload);
    }
    const data = PayloadMapper.parse(CreateMasterCodePacket, safePayload);
    return new CreateMasterCodePacket({
      configKey: data.configKey as string,
      index: (data.index as number) || 0,
      pin: data.pin as string
    });
  }
}
