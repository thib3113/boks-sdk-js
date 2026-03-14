import { PayloadMapper, PayloadUint8, PayloadByteArray } from '@/protocol/payload-mapper';
import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

export class NfcOpeningHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_NFC_OPENING;

  @PayloadUint8(3)
  public accessor tagType!: number;
  public readonly uid: string;

  @PayloadUint8(4)
  public accessor uidLength!: number;

  @PayloadByteArray(5, 7)
  public accessor rawUidBytes!: Uint8Array;

  constructor(props: { age: number; tagType: number; uid: string }, rawPayload?: Uint8Array) {
    super(NfcOpeningHistoryPacket.opcode, props.age, rawPayload);
    this.tagType = props.tagType;
    this.uid = props.uid;
  }

  static fromPayload(payload: Uint8Array): NfcOpeningHistoryPacket {
    const data = PayloadMapper.parse(NfcOpeningHistoryPacket, payload);

    let uid = '';
    const offset = 5;
    const uidLen = data.uidLength as number;

    // Strict validation, throw if data is not correctly matching the declared length
    if (uidLen > 0) {
      if (payload.length < offset + uidLen) {

        throw new BoksProtocolError(
          BoksProtocolErrorId.MALFORMED_DATA,
          `Payload too short for UID length ${uidLen}`
        );
      }
      uid = bytesToHex(payload.subarray(offset, offset + uidLen));
    }

    return new NfcOpeningHistoryPacket(
      { age: data.age as number, uid: uid, tagType: data.tagType as number },
      payload
    );
  }
}
