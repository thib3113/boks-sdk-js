import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes } from '@/utils/converters';
import { validateMasterCodeIndex } from '@/utils/validation';

/**
 * Command to delete a master code by index.
 */
export class DeleteMasterCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.DELETE_MASTER_CODE;
  get opcode() {
    return DeleteMasterCodePacket.opcode;
  }

  constructor(
    configKey: string,
    public readonly index: number
  ) {
    super(configKey);
    validateMasterCodeIndex(index);
  }

  static fromPayload(payload: Uint8Array): DeleteMasterCodePacket {
    const configKey = AuthPacket.extractConfigKey(payload);
    let index = 0;
    if (payload.length > 8) {
      index = payload[8];
    }
    return new DeleteMasterCodePacket(configKey, index);
  }

  toPayload(): Uint8Array {
    const payload = new Uint8Array(8 + 1);
    payload.set(stringToBytes(this.configKey), 0);
    payload[8] = this.index;
    return payload;
  }
}
