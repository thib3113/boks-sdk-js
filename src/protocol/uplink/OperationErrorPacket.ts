import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification of a code operation error.
 */
export class OperationErrorPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.CODE_OPERATION_ERROR;
  public errorCode: number = 0;

  constructor() {
    super(OperationErrorPacket.opcode);
  }

  parse(payload: Uint8Array) {
    super.parse(payload);
    if (payload.length > 0) {
      this.errorCode = payload[0];
    }
  }
}
