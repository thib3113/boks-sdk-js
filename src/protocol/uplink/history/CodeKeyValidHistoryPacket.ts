import { PayloadMapper, PayloadPinCode } from '@/protocol/payload-mapper';
import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

export class CodeKeyValidHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_CODE_KEY_VALID;

  @PayloadPinCode(3)
  public accessor code: string = '';

  constructor(props: { age: number; code: string }, rawPayload?: Uint8Array) {
    super(CodeKeyValidHistoryPacket.opcode, props.age, rawPayload);
    this.code = props.code;
  }

  static fromPayload(payload: Uint8Array): CodeKeyValidHistoryPacket {
    const data = PayloadMapper.parse(CodeKeyValidHistoryPacket, payload);
    return new CodeKeyValidHistoryPacket(
      { age: data.age as number, code: data.code as string },
      payload
    );
  }
}
