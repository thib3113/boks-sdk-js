import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes } from '@/utils/converters';
import { validatePinCode } from '@/utils/pin';

/**
 * Command to create a permanent master code at a specific index.
 */
export class CreateMasterCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.CREATE_MASTER_CODE;
  get opcode() {
    return CreateMasterCodePacket.opcode;
  }

  constructor(
    configKey: string,
    public readonly index: number,
    public readonly pin: string
  ) {
    super(configKey);
    validatePinCode(pin);
  }

  toPayload(): Uint8Array {
    const payload = new Uint8Array(8 + 6 + 1);
    payload.set(stringToBytes(this.configKey), 0);

    const pinBytes = stringToBytes(this.pin);
    const fixedPin = new Uint8Array(6);
    fixedPin.set(pinBytes.slice(0, 6));
    payload.set(fixedPin, 8);

    payload[14] = this.index;
    return payload;
  }
}
