import { PayloadMapper, PayloadUint8 } from '@/protocol/decorators';
import {
  BoksHistoryEvent,
  BoksHistoryEventProps
} from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: Power Off event.
 */
export interface PowerOffHistoryPacketProps extends BoksHistoryEventProps {
  reason: number;
}

export class PowerOffHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.POWER_OFF;

  @PayloadUint8(3)
  public accessor reason!: number;

  constructor(props: PowerOffHistoryPacketProps, rawPayload?: Uint8Array) {
    super(PowerOffHistoryPacket.opcode, props, rawPayload);
    this.reason = props.reason;
  }

  static fromPayload(payload: Uint8Array): PowerOffHistoryPacket {
    const data = PayloadMapper.parse<PowerOffHistoryPacketProps>(PowerOffHistoryPacket, payload);
    return new PowerOffHistoryPacket({ ...data, age: data._age } , payload);
  }
}
