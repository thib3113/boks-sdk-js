import { BoksPacketOptions } from '../_BoksPacketBase';
import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadMasterCodeIndex } from '@/protocol/decorators';

/**
 * Command to delete a master code by index.
 */
export interface DeleteMasterCodePacketProps extends AuthPacketProps {
  index: number;
}

export class DeleteMasterCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.DELETE_MASTER_CODE;
  get opcode() {
    return DeleteMasterCodePacket.opcode;
  }

  @PayloadMasterCodeIndex(8)
  public accessor index!: number;

  constructor(props: DeleteMasterCodePacketProps, raw?: Uint8Array) {
    super(props, raw);
    this.index = props.index;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): DeleteMasterCodePacket {
    const data = PayloadMapper.parse<DeleteMasterCodePacketProps>(
      DeleteMasterCodePacket,
      payload,
      options
    );
    return new DeleteMasterCodePacket(data, payload);
  }
}
