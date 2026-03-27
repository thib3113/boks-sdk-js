import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification of a successful code operation.
 */
export class OperationSuccessPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.CODE_OPERATION_SUCCESS;

  constructor(raw?: Uint8Array) {
    super(OperationSuccessPacket.opcode, raw);
  }

  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): OperationSuccessPacket {
    return new OperationSuccessPacket(payload);
  }
}
