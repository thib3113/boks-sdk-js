import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: NFC Tag registering scan event.
 */
export class NfcRegisteringHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_NFC_REGISTERING;
  public data: Uint8Array = new Uint8Array(0);

  constructor() {
    super(NfcRegisteringHistoryPacket.opcode);
  }

  parse(payload: Uint8Array) {
    const offset = super.parse(payload);
    this.data = payload.slice(offset);
  }
}


