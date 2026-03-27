import { BoksPacketOptions } from '../../_BoksPacketBase';
import { PayloadMapper, PayloadUint8 } from '@/protocol/decorators';
import {
  BoksHistoryEvent,
  BoksHistoryEventProps
} from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: System Error event.
 */
export interface ErrorHistoryPacketProps extends BoksHistoryEventProps {
  errorCode: number;
}

export class ErrorHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.LOG_EVENT_ERROR;

  @PayloadUint8(3)
  public accessor errorCode!: number;

  constructor(props: ErrorHistoryPacketProps, raw?: Uint8Array) {
    super(ErrorHistoryPacket.opcode, props, raw);
    this.errorCode = props.errorCode;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): ErrorHistoryPacket {
    const data = PayloadMapper.parse<ErrorHistoryPacketProps>(ErrorHistoryPacket, payload, options);
    return new ErrorHistoryPacket(data, payload);
  }
}
