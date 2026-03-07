import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes, hexToBytes, bytesToMac } from '@/utils/converters';

/**
 * NFC Tag Registration.
 */
export class NfcRegisterPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.REGISTER_NFC_TAG;
  get opcode() {
    return NfcRegisterPacket.opcode;
  }

  constructor(
    configKey: string,
    public readonly uid: string
  ) {
    super(configKey);
    this.uid = this.formatNfcUid(uid);
  }

  static fromPayload(payload: Uint8Array): NfcRegisterPacket {
    const configKey = AuthPacket.extractConfigKey(payload);
    let uid = '';
    if (payload.length > 8) {
      const len = payload[8];
      if (payload.length >= 9 + len) {
        uid = bytesToMac(payload.subarray(9, 9 + len), false);
      }
    }
    return new NfcRegisterPacket(configKey, uid);
  }

  toPayload() {
    const uidBytes = hexToBytes(this.uid);
    const payload = new Uint8Array(8 + 1 + uidBytes.length);
    payload.set(stringToBytes(this.configKey), 0);
    payload[8] = uidBytes.length; // UID Length (1 byte)
    payload.set(uidBytes, 9);
    return payload;
  }
}
