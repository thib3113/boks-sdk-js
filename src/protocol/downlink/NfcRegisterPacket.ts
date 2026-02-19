import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes, hexToBytes } from '@/utils/converters';

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
  }

  toPayload() {
    const uidBytes = hexToBytes(this.uid.replace(/:/g, ''));
    const payload = new Uint8Array(8 + 1 + uidBytes.length);
    payload.set(stringToBytes(this.configKey), 0);
    payload[8] = uidBytes.length; // UID Length (1 byte)
    payload.set(uidBytes, 9);
    return payload;
  }
}
