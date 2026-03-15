import { PayloadMapper, PayloadUint8, PayloadNfcUid } from '@/protocol/payload-mapper';
import {
  BoksHistoryEvent,
  BoksHistoryEventProps
} from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

export interface NfcOpeningHistoryPacketProps extends BoksHistoryEventProps {
  tagType: number;
  uid: string;
}

export class NfcOpeningHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_NFC_OPENING;

  @PayloadUint8(3)
  public accessor tagType!: number;
  public readonly uid: string;

  @PayloadNfcUid(4)
  public accessor nfcUidData!: string;

  constructor(props: NfcOpeningHistoryPacketProps, rawPayload?: Uint8Array) {
    super(NfcOpeningHistoryPacket.opcode, props, rawPayload);
    this.tagType = props.tagType;
    this.uid = props.uid;
  }

  static fromPayload(payload: Uint8Array): NfcOpeningHistoryPacket {
    const data = PayloadMapper.parse(NfcOpeningHistoryPacket, payload);
    return new NfcOpeningHistoryPacket(
      {
        age: data.age as number,
        tagType: data.tagType as number,
        uid: data.nfcUidData as string
      },
      payload
    );
  }
}
