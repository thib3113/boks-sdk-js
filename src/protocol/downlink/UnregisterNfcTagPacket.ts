import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes, hexToBytes } from '@/utils/converters';

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
