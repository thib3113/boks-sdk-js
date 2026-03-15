import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadUint24, PayloadMapper } from '@/protocol/payload-mapper';

/**
 * Log: Block Reset event.
 */
export class BlockResetHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.BLOCK_RESET;

  @PayloadUint24(0)
  public accessor _age: number = 0;

  constructor(age: number, rawPayload?: Uint8Array) {
    super(BlockResetHistoryPacket.opcode, age, rawPayload);
    this._age = age;
  }

  static fromPayload(payload: Uint8Array): BlockResetHistoryPacket {
    const data = PayloadMapper.parse(BlockResetHistoryPacket, payload);
    return new BlockResetHistoryPacket(data._age as number, payload);
  }
}
