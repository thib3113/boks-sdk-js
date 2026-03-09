import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { readPinFromBuffer, writePinToBuffer } from '@/utils/converters';
import { validatePinCode } from '@/utils/validation';

/**
 * Command to open the door with a 6-character PIN.
 */
export class OpenDoorPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.OPEN_DOOR;

  get opcode() {
    return OpenDoorPacket.opcode;
  }

  constructor(public readonly pin: string) {
    super();
    this.pin = this.formatPin(pin);
    validatePinCode(this.pin);
  }

  static fromPayload(payload: Uint8Array): OpenDoorPacket {
    return new OpenDoorPacket(readPinFromBuffer(payload, 0));
  }

  toPayload(): Uint8Array {
    const payload = new Uint8Array(6);
    writePinToBuffer(payload, 0, this.pin);
    return payload;
  }
}
