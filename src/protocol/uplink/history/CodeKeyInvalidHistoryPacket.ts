import { PayloadMapper, PayloadPinCode } from '@/protocol/payload-mapper';
import {
  BoksHistoryEvent,
  BoksHistoryEventProps
} from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

export interface CodeKeyInvalidHistoryPacketProps extends BoksHistoryEventProps {
  code: string;
}

export class CodeKeyInvalidHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_CODE_KEY_INVALID;

  @PayloadPinCode(3)
  public accessor code!: string;

  constructor(props: CodeKeyInvalidHistoryPacketProps, rawPayload?: Uint8Array) {
    super(CodeKeyInvalidHistoryPacket.opcode, props, rawPayload);
    this.code = props.code;
  }

  static fromPayload(payload: Uint8Array): CodeKeyInvalidHistoryPacket {
    const data = PayloadMapper.parse<CodeKeyInvalidHistoryPacketProps>(
      CodeKeyInvalidHistoryPacket,
      payload
    );
    return new CodeKeyInvalidHistoryPacket(data, payload);
  }
}
