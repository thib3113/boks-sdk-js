import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { writeConfigKeyToBuffer, hexToBytes, bytesToHex } from '@/utils/converters';
import { PayloadNfcUid } from '@/protocol/payload-mapper';

/**
 * Command to unregister an NFC tag.
 */
export class UnregisterNfcTagPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.UNREGISTER_NFC_TAG;
  get opcode() {
    return UnregisterNfcTagPacket.opcode;
  }

  @PayloadNfcUid(8)
  public accessor uid!: string;

  constructor(props: { configKey: string; uid: string }, rawPayload?: Uint8Array) {
    super(props.configKey, rawPayload);
    this.uid = props.uid;
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
    return new UnregisterNfcTagPacket({ configKey, uid }, payload);
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
