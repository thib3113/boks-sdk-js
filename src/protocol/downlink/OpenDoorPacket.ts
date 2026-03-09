import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToString, stringToBytes } from '@/utils/converters';

/**
 * Command to open the door with an optional PIN.
 */
export class OpenDoorPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.OPEN_DOOR;

  get opcode() {
    return OpenDoorPacket.opcode;
  }

  constructor(public readonly pin: string) {
    super();
    this.pin = this.formatPin(pin);
  }

  static fromPayload(payload: Uint8Array): OpenDoorPacket {
    return new OpenDoorPacket(bytesToString(payload));
  }

  toPayload() {
    return stringToBytes(this.pin);
  }
}
