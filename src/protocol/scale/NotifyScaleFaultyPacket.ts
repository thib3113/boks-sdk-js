import { BoksPacketOptions } from '../_BoksPacketBase';
import { PayloadMapper, PayloadByteArray } from '@/protocol/decorators';
import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/** ⚠️ This packet is theoretical; it has never been tested in real-world conditions. */
/**
 * Notification: Scale faulty.
 */
export class NotifyScaleFaultyPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_SCALE_FAULTY;

  @PayloadByteArray(0)
  public accessor data!: Uint8Array;

  constructor(data: Uint8Array, raw?: Uint8Array) {
    super(NotifyScaleFaultyPacket.opcode, raw);
    this.data = data;
  }

  static fromRaw(payload: Uint8Array, options?: BoksPacketOptions): NotifyScaleFaultyPacket {
    const data = PayloadMapper.parse(NotifyScaleFaultyPacket, payload, options);
    return new NotifyScaleFaultyPacket(data.data, payload);
  }
}
