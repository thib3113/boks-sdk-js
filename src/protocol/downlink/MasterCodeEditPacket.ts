import { BoksPacketOptions } from '../_BoksPacketBase';
import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode, PayloadMasterCodeIndex } from '@/protocol/decorators';

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

  constructor(props: MasterCodeEditPacketProps, raw?: Uint8Array) {
    super(props, raw);
    this.index = props.index;
    this.newPin = props.newPin;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): MasterCodeEditPacket {
    const data = PayloadMapper.parse<MasterCodeEditPacketProps>(
      MasterCodeEditPacket,
      payload,
      options
    );
    return new MasterCodeEditPacket(data, payload);
  }
}
