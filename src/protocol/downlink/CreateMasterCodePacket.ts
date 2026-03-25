import { BoksPacketOptions } from '../_BoksPacketBase';
import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode, PayloadMasterCodeIndex } from '@/protocol/decorators';

export interface CreateMasterCodePacketProps extends AuthPacketProps {
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

  constructor(props: CreateMasterCodePacketProps, raw?: Uint8Array) {
    super(props, raw);
    this.pin = props.pin;
    this.index = props.index;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): CreateMasterCodePacket {
    let safePayload = payload;
    if (payload.length === 14) {
      safePayload = new Uint8Array(15);
      safePayload.set(payload);
    }
    const data = PayloadMapper.parse<CreateMasterCodePacketProps>(
      CreateMasterCodePacket,
      safePayload,
      options
    );
    return new CreateMasterCodePacket(data, payload);
  }
}
