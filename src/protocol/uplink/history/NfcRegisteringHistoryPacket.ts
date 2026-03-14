import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';
import { PayloadUint24, PayloadMapper } from '@/protocol/payload-mapper';

/**
 * Log: NFC Tag registering scan event.
 */
export class NfcRegisteringHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_NFC_REGISTERING;

  @PayloadUint24(0)
  public accessor _age: number = 0;

  public readonly data: Uint8Array;

  constructor(props: { age: number; data: Uint8Array }, rawPayload?: Uint8Array) {
    super(NfcRegisteringHistoryPacket.opcode, props.age, rawPayload);
    this._age = props.age;
    this.data = props.data;
  }

  static fromPayload(payload: Uint8Array): NfcRegisteringHistoryPacket {
    const data = PayloadMapper.parse(NfcRegisteringHistoryPacket, payload);
    const nfcData = payload.length > 3 ? payload.subarray(3) : EMPTY_BUFFER;
    return new NfcRegisteringHistoryPacket({ age: data._age as number, data: nfcData }, payload);
  }
}
