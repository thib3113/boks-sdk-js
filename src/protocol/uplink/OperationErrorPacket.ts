import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadUint8, PayloadMapper } from '@/protocol/payload-mapper';

/**
 * Notification of a code operation error.
 */
export class OperationErrorPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.CODE_OPERATION_ERROR;

  @PayloadUint8(0)
  public accessor errorCode: number = 0;

  constructor(errorCode: number, rawPayload?: Uint8Array) {
    super(OperationErrorPacket.opcode, rawPayload);
    this.errorCode = errorCode;
  }

  static fromPayload(payload: Uint8Array): OperationErrorPacket {
    const data = PayloadMapper.parse(OperationErrorPacket, payload);
    return new OperationErrorPacket(data.errorCode as number, payload);
  }
}
