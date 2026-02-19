import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: BLE Reboot event.
 */
export class BleRebootHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.BLE_REBOOT;
  constructor() {
    super(BleRebootHistoryPacket.opcode);
  }
  parse(payload: Uint8Array) {
    super.parse(payload);
  }
}
