import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Block Reset event.
 */
export class BlockResetHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.BLOCK_RESET;

  constructor(age: number = 0, rawPayload?: Uint8Array) {
    super(BlockResetHistoryPacket.opcode, age, rawPayload);
  }

  static fromPayload(payload: Uint8Array): BlockResetHistoryPacket {
    let age = 0;
    if (payload.length >= 3) {
      age = (payload[0] << 16) | (payload[1] << 8) | payload[2];
    }
    return new BlockResetHistoryPacket(age, payload);
  }
}
