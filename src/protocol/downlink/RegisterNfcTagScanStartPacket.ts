import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes, bytesToString } from '@/utils/converters';

/**
 * Command to start NFC scanning for registration.
 */
export class RegisterNfcTagScanStartPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.REGISTER_NFC_TAG_SCAN_START;
  get opcode() {
    return RegisterNfcTagScanStartPacket.opcode;
  }

  constructor(configKey: string) {
    super(configKey);
  }

  static fromPayload(payload: Uint8Array): RegisterNfcTagScanStartPacket {
    const configKey = bytesToString(payload.subarray(0, 8));
    return new RegisterNfcTagScanStartPacket(configKey);
  }

  toPayload(): Uint8Array {
    return stringToBytes(this.configKey);
  }
}
