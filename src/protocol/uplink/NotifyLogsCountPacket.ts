import { BoksPacketOptions } from '../_BoksPacketBase';
import { PayloadMapper, PayloadUint16 } from '@/protocol/decorators';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification of the current number of logs stored.
 */
export class NotifyLogsCountPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_LOGS_COUNT;

  @PayloadUint16(0)
  public accessor count!: number;

  constructor(count: number, raw?: Uint8Array) {
    super(NotifyLogsCountPacket.opcode, raw);
    this.count = count;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): NotifyLogsCountPacket {
    const data = PayloadMapper.parse<NotifyLogsCountPacket>(
      NotifyLogsCountPacket,
      payload,
      options
    );
    return new NotifyLogsCountPacket(data.count, payload);
  }
}
