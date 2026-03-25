import { BoksPacketOptions } from '../../_BoksPacketBase';
import { PayloadMapper, PayloadHexString } from '@/protocol/decorators';
import {
  BoksHistoryEvent,
  BoksHistoryEventProps
} from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

export interface BlockResetHistoryPacketProps extends BoksHistoryEventProps {
  resetInfo: string;
}

/**
 * Log: Block Reset event.
 */
export class BlockResetHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.BLOCK_RESET;

  @PayloadHexString(3, 2)
  public accessor resetInfo!: string;

  constructor(props: BlockResetHistoryPacketProps, raw?: Uint8Array) {
    super(BlockResetHistoryPacket.opcode, props, raw);
    this.resetInfo = props.resetInfo;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): BlockResetHistoryPacket {
    const data = PayloadMapper.parse<BlockResetHistoryPacketProps>(
      BlockResetHistoryPacket, payload, options);
    return new BlockResetHistoryPacket(data, payload);
  }
}
