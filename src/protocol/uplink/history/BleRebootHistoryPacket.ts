import { BoksHistoryEvent } from '@/protocol/uplink/history/_BoksHistoryEventBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadUint24, PayloadMapper } from '@/protocol/payload-mapper';

/**
 * Log: BLE Reboot event.
 */
export class BleRebootHistoryPacket extends BoksHistoryEvent {
  static readonly opcode = BoksOpcode.BLE_REBOOT;

  @PayloadUint24(0)
  public accessor _age: number = 0;

  constructor(age: number, rawPayload?: Uint8Array) {
    super(BleRebootHistoryPacket.opcode, age, rawPayload);
    this._age = age;
  }

  static fromPayload(payload: Uint8Array): BleRebootHistoryPacket {
    const data = PayloadMapper.parse(BleRebootHistoryPacket, payload);
    return new BleRebootHistoryPacket(data._age as number, payload);
  }
}
