import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: NFC Tag registering scan event.
 */
export class NfcRegisteringHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_NFC_REGISTERING;

  constructor(
    age: number = 0,
    public readonly data: Uint8Array = new Uint8Array(0),
    rawPayload?: Uint8Array
  ) {
    super(NfcRegisteringHistoryPacket.opcode, age, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NfcRegisteringHistoryPacket {
    let age = 0;
    let data: Uint8Array = new Uint8Array(0);

    if (payload.length >= 3) {
      age = (payload[0] << 16) | (payload[1] << 8) | payload[2];
    }

    if (payload.length > 3) {
      data = payload.subarray(3) as Uint8Array;
    }
    return new NfcRegisteringHistoryPacket(age, data, payload);
  }
}
