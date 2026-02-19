import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Error: NFC Scan timeout.
 */
export class ErrorNfcScanTimeoutPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.ERROR_NFC_SCAN_TIMEOUT;
  public readonly status = 'timeout';

  constructor() {
    super(ErrorNfcScanTimeoutPacket.opcode);
  }

  parse(payload: Uint8Array) {
    super.parse(payload);
  }
}
