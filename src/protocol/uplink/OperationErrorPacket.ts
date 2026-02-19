import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification of a code operation error.
 */
export class OperationErrorPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.CODE_OPERATION_ERROR;

  constructor(
    public readonly errorCode: number = 0,
    rawPayload?: Uint8Array
  ) {
    super(OperationErrorPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): OperationErrorPacket {
    let errorCode = 0;
    if (payload.length > 0) {
      errorCode = payload[0];
    }
    return new OperationErrorPacket(errorCode, payload);
  }
}
