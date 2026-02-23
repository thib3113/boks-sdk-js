import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes, hexToBytes, bytesToString, bytesToHex } from '@/utils/converters';
import { validateNfcUid } from '@/utils/validation';

/**
 * Command to unregister an NFC tag.
 */
export class UnregisterNfcTagPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.UNREGISTER_NFC_TAG;
  get opcode() {
    return UnregisterNfcTagPacket.opcode;
  }

  constructor(
    configKey: string,
    public readonly uid: string
  ) {
    super(configKey);
    validateNfcUid(uid);
  }

  static fromPayload(payload: Uint8Array): UnregisterNfcTagPacket {
    const configKey = bytesToString(payload.slice(0, 8));
    let uid = '';
    if (payload.length > 8) {
      const len = payload[8];
      if (payload.length >= 9 + len) {
        uid =
          bytesToHex(payload.slice(9, 9 + len))
            .match(/.{1,2}/g)
            ?.join(':') || '';
      }
    }
    return new UnregisterNfcTagPacket(configKey, uid);
  }

  toPayload(): Uint8Array {
    const uidBytes = hexToBytes(this.uid.replace(/:/g, ''));
    const payload = new Uint8Array(8 + 1 + uidBytes.length);
    payload.set(stringToBytes(this.configKey), 0);
    payload[8] = uidBytes.length; // From protocol.md: UID_Length (1 octet)
    payload.set(uidBytes, 9);
    return payload;
  }
}
