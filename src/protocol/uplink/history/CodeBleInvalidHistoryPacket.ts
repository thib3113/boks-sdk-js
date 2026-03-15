import { PayloadMapper, PayloadPinCode, PayloadMacAddress } from '@/protocol/payload-mapper';
import {
  BoksHistoryEvent,
  BoksHistoryEventProps
} from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

export interface CodeBleInvalidHistoryPacketProps extends BoksHistoryEventProps {
  code: string;
  connectedMac: string;
}

export class CodeBleInvalidHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_CODE_BLE_INVALID;

  @PayloadPinCode(3)
  public accessor code!: string;

  @PayloadMacAddress(11)
  public accessor connectedMac!: string;

  constructor(props: CodeBleInvalidHistoryPacketProps, rawPayload?: Uint8Array) {
    super(CodeBleInvalidHistoryPacket.opcode, props, rawPayload);
    this.code = props.code;
    this.connectedMac = props.connectedMac;
  }

  static fromPayload(payload: Uint8Array): CodeBleInvalidHistoryPacket {
    const data = PayloadMapper.parse<CodeBleInvalidHistoryPacketProps>(
      CodeBleInvalidHistoryPacket,
      payload
    );
    return new CodeBleInvalidHistoryPacket(data, payload);
  }
}
