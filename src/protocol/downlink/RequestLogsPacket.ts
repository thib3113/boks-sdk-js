import { BoksPacketOptions } from '../_BoksPacketBase';
import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/**
 * Command to request logs retrieval
 */
export class RequestLogsPacket extends BoksPacket {
  constructor(raw?: Uint8Array) {
    super(raw);
  }
  static readonly opcode = BoksOpcode.REQUEST_LOGS;
  get opcode() {
    return RequestLogsPacket.opcode;
  }
  static fromRaw(payload: Uint8Array, _options?: BoksPacketOptions): RequestLogsPacket {
    return new RequestLogsPacket(payload);
  }
  toPayload() {
    return EMPTY_BUFFER;
  }
}
