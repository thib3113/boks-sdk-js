import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode, MAX_MASTER_CODE_INDEX } from '@/protocol/constants';
import { stringToBytes, bytesToString } from '@/utils/converters';
import { validatePinCode } from '@/utils/pin';

/**
 * Command to edit an existing master code.
 * (UNTESTED)
 */
export class MasterCodeEditPacket extends AuthPacket {
  static readonly opcode = BoksOpcode.MASTER_CODE_EDIT;
  get opcode() {
    return MasterCodeEditPacket.opcode;
  }

  constructor(
    configKey: string,
    public readonly index: number,
    public readonly newPin: string
  ) {
    super(configKey);
    if (!Number.isInteger(index) || index < 0 || index > MAX_MASTER_CODE_INDEX) {
      throw new Error(`Invalid master code index: ${index}. Must be an integer between 0 and ${MAX_MASTER_CODE_INDEX}.`);
    }
    validatePinCode(newPin);
  }

  static fromPayload(payload: Uint8Array): MasterCodeEditPacket {
    const configKey = bytesToString(payload.slice(0, 8));
    let index = 0;
    if (payload.length > 8) {
      index = payload[8];
    }
    const newPin = bytesToString(payload.slice(9, 15));
    return new MasterCodeEditPacket(configKey, index, newPin);
  }

  toPayload(): Uint8Array {
    const payload = new Uint8Array(8 + 1 + 6);
    payload.set(stringToBytes(this.configKey), 0);
    payload[8] = this.index;

    const pinBytes = stringToBytes(this.newPin);
    const fixedPin = new Uint8Array(6);
    fixedPin.set(pinBytes.slice(0, 6));
    payload.set(fixedPin, 9);

    return payload;
  }
}
