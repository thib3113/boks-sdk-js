import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Error: NFC Scan timeout.
 */
export class ErrorNfcScanTimeoutPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.ERROR_NFC_SCAN_TIMEOUT;
  public readonly status = 'timeout';

  constructor(raw?: Uint8Array) {
    super(ErrorNfcScanTimeoutPacket.opcode, raw);
  }

  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): ErrorNfcScanTimeoutPacket {
    return new ErrorNfcScanTimeoutPacket(payload);
  }
}
