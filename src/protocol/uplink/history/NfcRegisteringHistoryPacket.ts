import { PayloadMapper, PayloadByteArray } from '@/protocol/decorators';
import {
  BoksHistoryEvent,
  BoksHistoryEventProps
} from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: NFC Tag registering scan event.
 */
export interface NfcRegisteringHistoryPacketProps extends BoksHistoryEventProps {
  data: Uint8Array;
}

export class NfcRegisteringHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_NFC_REGISTERING;

  @PayloadByteArray(3)
  public accessor data!: Uint8Array;

  constructor(props: NfcRegisteringHistoryPacketProps, rawPayload?: Uint8Array) {
    super(NfcRegisteringHistoryPacket.opcode, props, rawPayload);
    this.data = props.data;
  }

  static fromPayload(payload: Uint8Array): NfcRegisteringHistoryPacket {
    const data = PayloadMapper.parse<NfcRegisteringHistoryPacketProps>(
      NfcRegisteringHistoryPacket,
      payload
    );
    return new NfcRegisteringHistoryPacket(
      {
        age: data._age,
        data: payload.length > 3 ? payload.subarray(3) : new Uint8Array(0)
      },
      payload
    );
  }
}
