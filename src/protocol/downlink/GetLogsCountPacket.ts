import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Command to get the number of logs stored.
 */
export class GetLogsCountPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.GET_LOGS_COUNT;
  get opcode() {
    return GetLogsCountPacket.opcode;
  }
  toPayload() {
    return new Uint8Array(0);
  }
}


