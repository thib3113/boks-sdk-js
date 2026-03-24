import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper, PayloadPinCode } from '@/protocol/decorators';

/**
 * Command to open the door with a 6-character PIN.
 */
export class OpenDoorPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.OPEN_DOOR;

  @PayloadPinCode(0)
  public accessor pin!: string;

  get opcode() {
    return OpenDoorPacket.opcode;
  }

  constructor(pin: string, raw?: Uint8Array) {
    super(raw);

    this.pin = pin;
  }

  static fromRaw(payload: Uint8Array): OpenDoorPacket {
    const data = PayloadMapper.parse<OpenDoorPacket>(OpenDoorPacket, payload);
    return new OpenDoorPacket(data.pin, payload);
  }
}
