import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/**
 * Log: NFC Tag registering scan event.
 */
export class NfcRegisteringHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_NFC_REGISTERING;

  public readonly data: Uint8Array;

  constructor(props: { age: number; data: Uint8Array }, rawPayload?: Uint8Array) {
    super(NfcRegisteringHistoryPacket.opcode, props.age, rawPayload);
    this.data = props.data;
  }

  static fromPayload(payload: Uint8Array): NfcRegisteringHistoryPacket {
    let age = 0;
    let data: Uint8Array = EMPTY_BUFFER;

    if (payload.length >= 3) {
      age = (payload[0] << 16) | (payload[1] << 8) | payload[2];
    }

    if (payload.length > 3) {
      data = payload.subarray(3) as Uint8Array;
    }
    return new NfcRegisteringHistoryPacket(
      { age: age as number, data: data || new Uint8Array(0) },
      payload
    );
  }
}
