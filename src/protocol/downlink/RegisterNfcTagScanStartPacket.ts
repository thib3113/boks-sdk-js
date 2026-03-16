import { PayloadMapper } from '@/protocol/decorators';
import { AuthPacket, AuthPacketProps } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Command to start NFC scanning for registration.
 */
export class RegisterNfcTagScanStartPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.REGISTER_NFC_TAG_SCAN_START;
  get opcode() {
    return RegisterNfcTagScanStartPacket.opcode;
  }

  constructor(props: AuthPacketProps, rawPayload?: Uint8Array) {
    super(props, rawPayload);
  }

  static fromPayload(payload: Uint8Array): RegisterNfcTagScanStartPacket {
    const data = PayloadMapper.parse<AuthPacketProps>(RegisterNfcTagScanStartPacket, payload);
    return new RegisterNfcTagScanStartPacket(data, payload);
  }
}
