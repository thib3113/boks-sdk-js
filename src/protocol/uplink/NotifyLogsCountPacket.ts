import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification of the current number of logs stored.
 */
export class NotifyLogsCountPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_LOGS_COUNT;

  constructor(
    public readonly count: number = 0,
    rawPayload?: Uint8Array
  ) {
    super(NotifyLogsCountPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyLogsCountPacket {
    let count = 0;
    if (payload.length >= 2) {
      const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
      count = view.getUint16(0, false); // Big Endian
    }
    return new NotifyLogsCountPacket(count, payload);
  }
}
