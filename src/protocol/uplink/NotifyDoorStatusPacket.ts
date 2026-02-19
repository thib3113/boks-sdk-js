import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Notification of the current door status.
 */
export class NotifyDoorStatusPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_DOOR_STATUS;

  constructor(
    public readonly isOpen: boolean = false,
    rawPayload?: Uint8Array
  ) {
    super(NotifyDoorStatusPacket.opcode, rawPayload);
  }

  static fromPayload(payload: Uint8Array): NotifyDoorStatusPacket {
    let isOpen = false;
    if (payload.length >= 2) {
      // Logic: Open if Inverted == 0x00 and Raw == 0x01
      // Closed if Inverted == 0x01 and Raw == 0x00
      const inverted = payload[0];
      const raw = payload[1];
      isOpen = raw === 0x01 && inverted === 0x00;
    }
    return new NotifyDoorStatusPacket(isOpen, payload);
  }
}
