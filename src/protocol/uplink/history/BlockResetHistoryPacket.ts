import { PayloadMapper } from '@/protocol/payload-mapper';
import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Block Reset event.
 */
export class BlockResetHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.BLOCK_RESET;

  constructor(age: number, rawPayload?: Uint8Array) {
    super(BlockResetHistoryPacket.opcode, age, rawPayload);
  }

  static fromPayload(payload: Uint8Array): BlockResetHistoryPacket {
    const data = PayloadMapper.parse(BlockResetHistoryPacket, payload);
    return new BlockResetHistoryPacket(data.age as number, payload);
  }
}
