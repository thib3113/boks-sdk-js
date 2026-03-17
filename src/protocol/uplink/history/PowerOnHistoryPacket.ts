import { PayloadMapper } from '@/protocol/decorators';
import {
  BoksHistoryEvent,
  BoksHistoryEventProps
} from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Power On event.
 * (UNTESTED)
 */
export class PowerOnHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.POWER_ON;

  constructor(props: BoksHistoryEventProps, rawPayload?: Uint8Array) {
    super(PowerOnHistoryPacket.opcode, props, rawPayload);
  }

  static fromPayload(payload: Uint8Array): PowerOnHistoryPacket {
    const data = PayloadMapper.parse<BoksHistoryEventProps>(PowerOnHistoryPacket, payload);
    return new PowerOnHistoryPacket(data, payload);
  }
}
