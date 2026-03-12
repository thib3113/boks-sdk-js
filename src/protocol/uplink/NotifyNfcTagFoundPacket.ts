import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

/**
 * Notification: NFC Tag found during scan.
 */
export class NotifyNfcTagFoundPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_NFC_TAG_FOUND;
  public readonly status = 'found';

  constructor(
    public readonly uid: string,
    rawPayload?: Uint8Array
  ) {
    super(NotifyNfcTagFoundPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyNfcTagFoundPacket {
    if (payload.length < 1) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.MALFORMED_DATA,
        'Payload too short for NotifyNfcTagFoundPacket',
        { length: payload.length }
      );
    }
    const uidLength = payload[0];
    if (uidLength > 10) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.MALFORMED_DATA,
        'UID length greater than 10 is not supported',
        { length: uidLength }
      );
    }
    if (payload.length < 1 + uidLength) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.MALFORMED_DATA,
        'Payload too short for specified UID length',
        { length: payload.length, expected: 1 + uidLength }
      );
    }
    const uidBytes = payload.subarray(1, 1 + uidLength);
    const uid = bytesToHex(uidBytes);
    return new NotifyNfcTagFoundPacket(uid, payload);
  }
}
