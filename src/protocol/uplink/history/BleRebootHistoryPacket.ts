import { BoksPacketOptions } from '../../_BoksPacketBase';
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

  constructor(props: BoksHistoryEventProps, raw?: Uint8Array) {
    super(BleRebootHistoryPacket.opcode, props, raw);
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): BleRebootHistoryPacket {
    const data = PayloadMapper.parse<BoksHistoryEventProps>(
      BleRebootHistoryPacket,
      payload,
      options
    );
    return new BleRebootHistoryPacket(data, payload);
  }
}
