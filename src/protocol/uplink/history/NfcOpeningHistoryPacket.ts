import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

/**
 * Log: Door opened via NFC.
 * (UNTESTED)
 */
export class NfcOpeningHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_NFC_OPENING;

  constructor(
    age: number = 0,
    public readonly tagType: number = 0,
    public readonly uid: string = '',
    rawPayload?: Uint8Array
  ) {
    super(NfcOpeningHistoryPacket.opcode, age, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NfcOpeningHistoryPacket {
    let age = 0;
    let tagType = 0;
    let uid = '';

    if (payload.length >= 3) {
      age = (payload[0] << 16) | (payload[1] << 8) | payload[2];
    }

    let offset = 3;
    if (payload.length > offset) {
      tagType = payload[offset];
      offset++;
    }
    if (payload.length > offset) {
      // Assuming next byte is length? The original code did: const uidLen = payload[offset];
      // But didn't check if payload had enough bytes for length byte?
      // "if (payload.length > offset)" covers the length byte existence.
      const uidLen = payload[offset];
      offset++;
      if (payload.length >= offset + uidLen) {
        uid = bytesToHex(payload.subarray(offset, offset + uidLen));
      }
    }
    return new NfcOpeningHistoryPacket(age, tagType, uid, payload);
  }
}
