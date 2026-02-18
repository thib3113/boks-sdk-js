import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Command to request logs retrieval
 */
export class RequestLogsPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.REQUEST_LOGS;
  get opcode() {
    return RequestLogsPacket.opcode;
  }
  toPayload() {
    return new Uint8Array(0);
  }
}


