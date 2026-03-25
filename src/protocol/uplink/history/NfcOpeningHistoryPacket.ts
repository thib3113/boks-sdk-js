import { BoksPacketOptions } from '../../_BoksPacketBase';
import { PayloadMapper, PayloadUint8, PayloadNfcUid } from '@/protocol/decorators';
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

  @PayloadNfcUid(4)
  public accessor uid!: string;

  constructor(props: NfcOpeningHistoryPacketProps, raw?: Uint8Array) {
    super(NfcOpeningHistoryPacket.opcode, props, raw);
    this.tagType = props.tagType;
    this.uid = props.uid;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): NfcOpeningHistoryPacket {
    const data = PayloadMapper.parse<NfcOpeningHistoryPacketProps>(
      NfcOpeningHistoryPacket, payload, options);
    return new NfcOpeningHistoryPacket(data, payload);
  }
}
