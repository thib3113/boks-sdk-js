import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: BLE Reboot event.
 */
export class BleRebootHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.BLE_REBOOT;

  constructor(age: number = 0, rawPayload?: Uint8Array) {
    super(BleRebootHistoryPacket.opcode, age, rawPayload);
  }

  static fromPayload(payload: Uint8Array): BleRebootHistoryPacket {
    let age = 0;
    if (payload.length >= 3) {
      age = (payload[0] << 16) | (payload[1] << 8) | payload[2];
    }
    return new BleRebootHistoryPacket(age, payload);
  }
}
