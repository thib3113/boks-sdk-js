import { PayloadMapper, PayloadPinCode } from '@/protocol/payload-mapper';
import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

export class CodeKeyInvalidHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_CODE_KEY_INVALID;

  @PayloadPinCode(3)
  public accessor code: string = '';

  constructor(age: number = 0, code: string = '', rawPayload?: Uint8Array) {
    super(CodeKeyInvalidHistoryPacket.opcode, age, rawPayload);
    this.code = code;
  }

  static fromPayload(payload: Uint8Array): CodeKeyInvalidHistoryPacket {
    const data = PayloadMapper.parse(CodeKeyInvalidHistoryPacket, payload);
    return new CodeKeyInvalidHistoryPacket(data.age as number, data.code as string, payload);
  }
}
