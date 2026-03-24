import { PayloadMapper, PayloadUint8 } from '@/protocol/decorators';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification of a code operation error.
 */
export class OperationErrorPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.CODE_OPERATION_ERROR;

  @PayloadUint8(0)
  public accessor errorCode!: number;

  constructor(errorCode: number, raw?: Uint8Array) {
    super(OperationErrorPacket.opcode, raw);
    this.errorCode = errorCode;
  }

  static fromRaw(payload: Uint8Array): OperationErrorPacket {
    const data = PayloadMapper.parse<OperationErrorPacket>(OperationErrorPacket, payload);
    return new OperationErrorPacket(data.errorCode, payload);
  }
}
