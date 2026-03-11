import { PayloadMapper, PayloadPinCode, PayloadMacAddress } from '@/protocol/payload-mapper';
import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

export class CodeBleValidHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_CODE_BLE_VALID;

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
    super(CodeBleValidHistoryPacket.opcode, age, rawPayload);
    this.parsedCode = code;
    this.parsedConnectedMac = connectedMac;
  }

  static fromPayload(payload: Uint8Array): CodeBleValidHistoryPacket {
    const data = PayloadMapper.parse(CodeBleValidHistoryPacket, payload);
    return new CodeBleValidHistoryPacket(
      data.age as number,
      (data.parsedCode as string) || '',
      (data.parsedConnectedMac as string) || '',
      payload
    );
  }
}
