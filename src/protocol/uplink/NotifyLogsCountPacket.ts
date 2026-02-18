import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification of the current number of logs stored.
 */
export class NotifyLogsCountPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_LOGS_COUNT;
  public count: number = 0;

  constructor() {
    super(NotifyLogsCountPacket.opcode);
  }

  parse(payload: Uint8Array) {
    super.parse(payload);
    if (payload.length >= 2) {
      const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
      this.count = view.getUint16(0, false); // Big Endian
    }
  }
}


