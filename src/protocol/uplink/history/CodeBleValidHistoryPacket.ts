import { PayloadMapper, PayloadPinCode, PayloadMacAddress } from '@/protocol/decorators';
import {
  BoksHistoryEvent,
  BoksHistoryEventProps
} from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

export interface CodeBleValidHistoryPacketProps extends BoksHistoryEventProps {
  code: string;
  connectedMac: string;
}

export class CodeBleValidHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_CODE_BLE_VALID;

  @PayloadPinCode(3, { allowIds: true })
  public accessor code!: string;

  @PayloadMacAddress(11)
  public accessor connectedMac!: string;

  constructor(props: CodeBleValidHistoryPacketProps, rawPayload?: Uint8Array) {
    super(CodeBleValidHistoryPacket.opcode, props, rawPayload);
    this.code = props.code;
    this.connectedMac = props.connectedMac;
  }

  static fromPayload(payload: Uint8Array): CodeBleValidHistoryPacket {
    const data = PayloadMapper.parse<CodeBleValidHistoryPacketProps>(
      CodeBleValidHistoryPacket,
      payload
    );
    return new CodeBleValidHistoryPacket(data, payload);
  }
}
