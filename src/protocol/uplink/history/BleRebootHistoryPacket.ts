import { PayloadMapper } from '@/protocol/payload-mapper';
import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: BLE Reboot event.
 */
export class BleRebootHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.BLE_REBOOT;

  constructor(age: number, rawPayload?: Uint8Array) {
    super(BleRebootHistoryPacket.opcode, age, rawPayload);
  }

  static fromPayload(payload: Uint8Array): BleRebootHistoryPacket {
    const data = PayloadMapper.parse(BleRebootHistoryPacket, payload);
    return new BleRebootHistoryPacket(data.age as number, payload);
  }
}
