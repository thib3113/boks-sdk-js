import { BoksPacketOptions } from '../../_BoksPacketBase';
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

  @PayloadPinCode(3, { allowIds: true })
  public accessor code!: string;

  constructor(props: CodeKeyValidHistoryPacketProps, raw?: Uint8Array) {
    super(CodeKeyValidHistoryPacket.opcode, props, raw);
    this.code = props.code;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): CodeKeyValidHistoryPacket {
    const data = PayloadMapper.parse<CodeKeyValidHistoryPacketProps>(
      CodeKeyValidHistoryPacket, payload, options);
    return new CodeKeyValidHistoryPacket(data, payload);
  }
}
