import { PayloadMapper, PayloadUint16 } from '@/protocol/payload-mapper';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification of the current number of logs stored.
 */
export class NotifyLogsCountPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_LOGS_COUNT;

  @PayloadUint16(0)
  public accessor count!: number;

  constructor(count: number, rawPayload?: Uint8Array) {
    super(NotifyLogsCountPacket.opcode, rawPayload);
    this.count = count;
  }

  static fromPayload(payload: Uint8Array): NotifyLogsCountPacket {
    const data = PayloadMapper.parse(NotifyLogsCountPacket, payload);
    return new NotifyLogsCountPacket(data.count as number, payload);
  }
}
