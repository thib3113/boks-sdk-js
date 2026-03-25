import { BoksPacketOptions } from '../../_BoksPacketBase';
import { PayloadMapper, PayloadPinCode, PayloadMacAddress } from '@/protocol/decorators';
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

  @PayloadPinCode(3, { allowIds: true })
  public accessor code!: string;

  @PayloadMacAddress(11)
  public accessor connectedMac!: string;

  constructor(props: CodeBleInvalidHistoryPacketProps, raw?: Uint8Array) {
    super(CodeBleInvalidHistoryPacket.opcode, props, raw);
    this.code = props.code;
    this.connectedMac = props.connectedMac;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): CodeBleInvalidHistoryPacket {
    const data = PayloadMapper.parse<CodeBleInvalidHistoryPacketProps>(
      CodeBleInvalidHistoryPacket, payload, options);
    return new CodeBleInvalidHistoryPacket(data, payload);
  }
}
