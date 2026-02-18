import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

/**
 * Log: Door opened via NFC.
 * (UNTESTED)
 */
export class NfcOpeningHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_NFC_OPENING;
  public tagType: number = 0;
  public uid: string = '';

  constructor() {
    super(NfcOpeningHistoryPacket.opcode);
  }

  parse(payload: Uint8Array) {
    let offset = super.parse(payload);
    if (payload.length > offset) {
      this.tagType = payload[offset];
      offset++;
    }
    if (payload.length > offset) {
      const uidLen = payload[offset];
      offset++;
      if (payload.length >= offset + uidLen) {
        this.uid = bytesToHex(payload.slice(offset, offset + uidLen));
      }
    }
  }
}


