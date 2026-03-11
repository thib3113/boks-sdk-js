import { PayloadMapper, PayloadPinCode, PayloadMacAddress } from '@/protocol/payload-mapper';
import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

export class CodeBleInvalidHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_CODE_BLE_INVALID;

  @PayloadPinCode(3)
  public accessor code: string = '';

  @PayloadMacAddress(11)
  public accessor connectedMac: string = '';

  constructor(
    age: number = 0,
    code: string = '',
    connectedMac: string = '',
    rawPayload?: Uint8Array
  ) {
    super(CodeBleInvalidHistoryPacket.opcode, age, rawPayload);
    this.code = code;
    this.connectedMac = connectedMac;
  }

  static fromPayload(payload: Uint8Array): CodeBleInvalidHistoryPacket {
    const data = PayloadMapper.parse(CodeBleInvalidHistoryPacket, payload);
    return new CodeBleInvalidHistoryPacket(
      data.age as number,
      (data.code as string) || '',
      (data.connectedMac as string) || '',
      payload
    );
  }
}
