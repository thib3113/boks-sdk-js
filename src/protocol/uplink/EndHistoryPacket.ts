import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * End of history transfer marker.
 */
export class EndHistoryPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.LOG_END_HISTORY;
  constructor() {
    super(EndHistoryPacket.opcode);
  }
  parse() {}
}


