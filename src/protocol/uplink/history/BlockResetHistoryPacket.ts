import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Block Reset event.
 */
export class BlockResetHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.BLOCK_RESET;
  constructor() {
    super(BlockResetHistoryPacket.opcode);
  }
  parse(payload: Uint8Array) {
    super.parse(payload);
  }
}
