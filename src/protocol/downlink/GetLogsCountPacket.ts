import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/**
 * Command to get the number of logs stored.
 */
export class GetLogsCountPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.GET_LOGS_COUNT;
  get opcode() {
    return GetLogsCountPacket.opcode;
  }
  static fromRaw(payload: Uint8Array): GetLogsCountPacket {
    return new GetLogsCountPacket(payload);
  }
  toPayload() {
    return EMPTY_BUFFER;
  }
}
