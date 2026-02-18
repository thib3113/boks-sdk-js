import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification of a successful code operation.
 */
export class OperationSuccessPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.CODE_OPERATION_SUCCESS;
  constructor() {
    super(OperationSuccessPacket.opcode);
  }
  parse(payload: Uint8Array) {
    super.parse(payload);} // No data
}

