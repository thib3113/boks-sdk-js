import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadMasterCodeIndex } from '@/protocol/payload-mapper';
import { validateMasterCodeIndex } from '@/utils/validation';

/**
 * Command to delete a master code by index.
 */
export class DeleteMasterCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.DELETE_MASTER_CODE;
  get opcode() {
    return DeleteMasterCodePacket.opcode;
  }

  @PayloadMasterCodeIndex(8)
  public accessor index!: number;

  constructor(configKey: string, index: number) {
    super(configKey);
    validateMasterCodeIndex(index);
    this.index = index;
  }

  static fromPayload(payload: Uint8Array): DeleteMasterCodePacket {
    let safePayload = payload;
    if (payload.length === 8) {
      safePayload = new Uint8Array(9);
      safePayload.set(payload);
    }
    const data = PayloadMapper.parse(DeleteMasterCodePacket, safePayload);
    return new DeleteMasterCodePacket(data.configKey as string, data.index as number);
  }
}
