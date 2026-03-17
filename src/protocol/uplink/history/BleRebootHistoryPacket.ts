import { PayloadMapper } from '@/protocol/decorators';
import {
  BoksHistoryEvent,
  BoksHistoryEventProps
} from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Log: BLE Reboot event.
 */
export class BleRebootHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.BLE_REBOOT;

  constructor(props: BoksHistoryEventProps, rawPayload?: Uint8Array) {
    super(BleRebootHistoryPacket.opcode, props, rawPayload);
  }

  static fromPayload(payload: Uint8Array): BleRebootHistoryPacket {
    const data = PayloadMapper.parse<BoksHistoryEventProps>(BleRebootHistoryPacket, payload);
    return new BleRebootHistoryPacket({ age: (data as any)._age }, payload);
  }
}
