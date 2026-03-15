import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadMasterCodeIndex } from '@/protocol/payload-mapper';

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

  constructor(props: DeleteMasterCodePacketProps, rawPayload?: Uint8Array) {
    super(props, rawPayload);
    this.index = props.index;
  }

  static fromPayload(payload: Uint8Array): DeleteMasterCodePacket {
    const data = PayloadMapper.parse(DeleteMasterCodePacket, payload);
    return new DeleteMasterCodePacket(data as unknown as DeleteMasterCodePacketProps, payload);
  }
}
