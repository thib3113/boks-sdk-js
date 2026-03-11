import { PayloadMapper, PayloadPinCode, PayloadMacAddress } from '@/protocol/payload-mapper';
import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

export class CodeBleInvalidHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_CODE_BLE_INVALID;

  @PayloadPinCode(3)
  public accessor parsedCode: string = '';

  @PayloadMacAddress(11)
  public accessor parsedConnectedMac: string = '';

  constructor(
    age: number = 0,
    public readonly code: string = '',
    public readonly connectedMac: string = '',
    rawPayload?: Uint8Array
  ) {
    super(CodeBleInvalidHistoryPacket.opcode, age, rawPayload);
    this.parsedCode = code;
    this.parsedConnectedMac = connectedMac;
  }

  static fromPayload(payload: Uint8Array): CodeBleInvalidHistoryPacket {
    const data = PayloadMapper.parse(CodeBleInvalidHistoryPacket, payload);
    return new CodeBleInvalidHistoryPacket(
      data.age as number,
      (data.parsedCode as string) || '',
      (data.parsedConnectedMac as string) || '',
      payload
    );
  }
}
