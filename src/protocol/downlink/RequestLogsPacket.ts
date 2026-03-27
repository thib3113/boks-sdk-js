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
  static fromPayload(payload: Uint8Array): RequestLogsPacket {
    return new RequestLogsPacket(payload);
  }
  toPayload() {
    return EMPTY_BUFFER;
  }
}
