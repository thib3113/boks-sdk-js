import { PayloadMapper } from '@/protocol/decorators';
import {
  BoksHistoryEvent,
  BoksHistoryEventProps
} from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Block Reset event.
 */
export class BlockResetHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.BLOCK_RESET;

  constructor(props: BoksHistoryEventProps, rawPayload?: Uint8Array) {
    super(BlockResetHistoryPacket.opcode, props, rawPayload);
  }

  static fromPayload(payload: Uint8Array): BlockResetHistoryPacket {
    const data = PayloadMapper.parse<BoksHistoryEventProps>(BlockResetHistoryPacket, payload);
    return new BlockResetHistoryPacket({ age: data.age }, payload);
  }
}
