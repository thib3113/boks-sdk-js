import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { BoksProtocolErrorId } from '@/errors/BoksProtocolError';
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

  constructor(props: CreateMasterCodePacketProps, rawPayload?: Uint8Array) {
    super(props, rawPayload);
    this.pin = props.pin;
    this.index = props.index;
  }

  static fromPayload(payload: Uint8Array): CreateMasterCodePacket {
    let safePayload = payload;
    if (payload.length === 14) {
      safePayload = new Uint8Array(15);
      safePayload.set(payload);
    }
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    let data: any;
    data = PayloadMapper.parse<CreateMasterCodePacketProps>(CreateMasterCodePacket, safePayload);
    return new CreateMasterCodePacket({
      configKey: data.configKey,
      index: data.index || 0,
      pin: data.pin as string
    });
  }
}
