import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/**
 * Command to request logs retrieval
 */
export class RequestLogsPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.REQUEST_LOGS;
  get opcode() {
    return RequestLogsPacket.opcode;
  }
  static fromPayload(_payload: Uint8Array): RequestLogsPacket {
    return new RequestLogsPacket();
  }
  toPayload() {
    return EMPTY_BUFFER;
  }
}
