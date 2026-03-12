import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadUint8, PayloadMapper } from '@/protocol/payload-mapper';

/**
 * Notification of the current door status.
 */
export class NotifyDoorStatusPacket extends BoksRXPacket {
  static readonly opcode = BoksOpcode.NOTIFY_DOOR_STATUS;

  @PayloadUint8(0)
  public accessor inverted!: number;

  @PayloadUint8(1)
  public accessor raw!: number;

  public get isOpen(): boolean {
    return this.raw === 0x01 && this.inverted === 0x00;
  }

  constructor(inverted: number, raw: number, rawPayload?: Uint8Array) {
    super(NotifyDoorStatusPacket.opcode, rawPayload);
    this.inverted = inverted;
    this.raw = raw;
  }

  static fromPayload(payload: Uint8Array): NotifyDoorStatusPacket {
    const parsed = PayloadMapper.parse(NotifyDoorStatusPacket, payload);
    return new NotifyDoorStatusPacket(parsed.inverted!, parsed.raw!, payload);
  }
}
