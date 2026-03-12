import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { writeConfigKeyToBuffer, hexToBytes, bytesToHex } from '@/utils/converters';

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
    this.uid = this.formatNfcUid(uid);
  }

  static fromPayload(payload: Uint8Array): UnregisterNfcTagPacket {
    const configKey = AuthPacket.extractConfigKey(payload);
    let uid = '';
    if (payload.length > 8) {
      const len = payload[8];
      if (payload.length >= 9 + len) {
        uid = bytesToHex(payload.subarray(9, 9 + len));
      }
    }
    return new UnregisterNfcTagPacket(configKey, uid);
  }

  toPayload(): Uint8Array {
    const uidBytes = hexToBytes(this.uid);
    const payload = new Uint8Array(8 + 1 + uidBytes.length);
    writeConfigKeyToBuffer(payload, 0, this.configKey);
    payload[8] = uidBytes.length; // From protocol.md: UID_Length (1 octet)
    payload.set(uidBytes, 9);
    return payload;
  }
}
