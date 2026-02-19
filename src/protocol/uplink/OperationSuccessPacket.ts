import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification of a successful code operation.
 */
export class OperationSuccessPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.CODE_OPERATION_SUCCESS;

  constructor(rawPayload?: Uint8Array) {
    super(OperationSuccessPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): OperationSuccessPacket {
    return new OperationSuccessPacket(payload);
  }
}
