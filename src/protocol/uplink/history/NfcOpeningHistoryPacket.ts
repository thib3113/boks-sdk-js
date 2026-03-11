import { PayloadMapper, PayloadUint8, PayloadByteArray } from '@/protocol/payload-mapper';
import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

export class NfcOpeningHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_NFC_OPENING;

  @PayloadUint8(3)
  public accessor parsedTagType: number = 0;

  @PayloadUint8(4)
  public accessor parsedUidLength: number = 0;

  @PayloadByteArray(5, 7)
  public accessor rawUidBytes: Uint8Array = new Uint8Array(0);

  constructor(
    age: number = 0,
    public readonly tagType: number = 0,
    public readonly uid: string = '',
    rawPayload?: Uint8Array
  ) {
    super(NfcOpeningHistoryPacket.opcode, age, rawPayload);
    this.parsedTagType = tagType;
  }

  static fromPayload(payload: Uint8Array): NfcOpeningHistoryPacket {
    const data = PayloadMapper.parse(NfcOpeningHistoryPacket, payload);

    let uid = '';
    const offset = 5;
    const uidLen = (data.parsedUidLength as number) || 0;

    if (uidLen > 0 && payload.length >= offset + uidLen) {
      uid = bytesToHex(payload.subarray(offset, offset + uidLen));
    }

    return new NfcOpeningHistoryPacket(
      data.age as number,
      (data.parsedTagType as number) || 0,
      uid,
      payload
    );
  }
}
