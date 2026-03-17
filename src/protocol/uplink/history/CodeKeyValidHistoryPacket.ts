import { PayloadMapper, PayloadPinCode } from '@/protocol/decorators';
import {
  BoksHistoryEvent,
  BoksHistoryEventProps
} from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

export interface CodeKeyValidHistoryPacketProps extends BoksHistoryEventProps {
  code: string;
}

export class CodeKeyValidHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_CODE_KEY_VALID;

  @PayloadPinCode(3)
  public accessor code!: string;

  constructor(props: CodeKeyValidHistoryPacketProps, rawPayload?: Uint8Array) {
    super(CodeKeyValidHistoryPacket.opcode, props, rawPayload);
    this.code = props.code;
  }

  static fromPayload(payload: Uint8Array): CodeKeyValidHistoryPacket {
    const data = PayloadMapper.parse<CodeKeyValidHistoryPacketProps>(
      CodeKeyValidHistoryPacket,
      payload
    );
    return new CodeKeyValidHistoryPacket({ ...data, age: (data as any)._age } as any, payload);
  }
}
