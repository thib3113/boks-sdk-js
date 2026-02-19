import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification of the current door status.
 */
export class NotifyDoorStatusPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_DOOR_STATUS;
  public isOpen: boolean = false;

  constructor() {
    super(NotifyDoorStatusPacket.opcode);
  }

  parse(payload: Uint8Array) {
    super.parse(payload);
    if (payload.length >= 2) {
      // Logic: Open if Inverted == 0x00 and Raw == 0x01
      // Closed if Inverted == 0x01 and Raw == 0x00
      const inverted = payload[0];
      const raw = payload[1];
      this.isOpen = raw === 0x01 && inverted === 0x00;
    }
  }
}
