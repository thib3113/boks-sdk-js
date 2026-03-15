import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode, PayloadMasterCodeIndex } from '@/protocol/payload-mapper';

/**
 * Command to edit an existing master code.
 * (UNTESTED)
 */
export interface MasterCodeEditPacketProps extends AuthPacketProps {
  index: number;
  newPin: string;
}

export class MasterCodeEditPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.MASTER_CODE_EDIT;
  get opcode() {
    return MasterCodeEditPacket.opcode;
  }

  @PayloadMasterCodeIndex(8)
  public accessor index!: number;

  @PayloadPinCode(9)
  public accessor newPin!: string;

  constructor(props: MasterCodeEditPacketProps, rawPayload?: Uint8Array) {
    super(props, rawPayload);
    this.index = props.index;
    this.newPin = props.newPin;
  }

  static fromPayload(payload: Uint8Array): MasterCodeEditPacket {
    const data = PayloadMapper.parse<MasterCodeEditPacketProps>(MasterCodeEditPacket, payload);
    return new MasterCodeEditPacket(data, payload);
  }
}
