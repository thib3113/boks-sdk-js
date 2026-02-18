import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification: Configuration applied successfully.
 */
export class NotifySetConfigurationSuccessPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SET_CONFIGURATION_SUCCESS;
  constructor() {
    super(NotifySetConfigurationSuccessPacket.opcode);
  }
  parse() {}
}


