import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { validatePinCode } from '@/utils/validation';
import { PayloadMapper, PayloadPinCode } from '@/protocol/payload-mapper';

/**
 * Command to open the door with a 6-character PIN.
 */
export class OpenDoorPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.OPEN_DOOR;

  @PayloadPinCode(0)
  public readonly pin: string;

  get opcode() {
    return OpenDoorPacket.opcode;
  }

  constructor(pin: string) {
    super();
    this.pin = this.formatPin(pin);
    validatePinCode(this.pin);
  }

  static fromPayload(payload: Uint8Array): OpenDoorPacket {
    const data = PayloadMapper.parse(OpenDoorPacket, payload);
    return new OpenDoorPacket(data.pin!);
  }

  toPayload(): Uint8Array {
    return PayloadMapper.serialize(this);
  }
}
