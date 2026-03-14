import { PayloadMapper, PayloadPinCode, PayloadMacAddress } from '@/protocol/payload-mapper';
import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

export class CodeBleInvalidHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_CODE_BLE_INVALID;

  @PayloadPinCode(3)
  public accessor code: string = '';

  @PayloadMacAddress(11)
  public accessor connectedMac: string = '';

  constructor(props: { age: number; code: string; connectedMac: string }, rawPayload?: Uint8Array) {
    super(CodeBleInvalidHistoryPacket.opcode, props.age, rawPayload);
    this.code = props.code;
    this.connectedMac = props.connectedMac;
  }

  static fromPayload(payload: Uint8Array): CodeBleInvalidHistoryPacket {
    const data = PayloadMapper.parse(CodeBleInvalidHistoryPacket, payload);
    return new CodeBleInvalidHistoryPacket(
      {
        age: data.age as number,
        code: data.code as string,
        connectedMac: data.connectedMac as string
      },
      payload
    );
  }
}
