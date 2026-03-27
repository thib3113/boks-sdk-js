import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Error: NFC Tag already exists during scan.
 */
export class ErrorNfcTagAlreadyExistsScanPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.ERROR_NFC_TAG_ALREADY_EXISTS_SCAN;
  public readonly status = 'already_exists';

  constructor(rawPayload?: Uint8Array) {
    super(ErrorNfcTagAlreadyExistsScanPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): ErrorNfcTagAlreadyExistsScanPacket {
    return new ErrorNfcTagAlreadyExistsScanPacket(payload);
  }
}
