import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Code generation succeeded.
 */
export class NotifyCodeGenerationSuccessPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_CODE_GENERATION_SUCCESS;
  constructor() {
    super(NotifyCodeGenerationSuccessPacket.opcode);
  }
  parse(payload: Uint8Array) {
    super.parse(payload);}
}

