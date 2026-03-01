import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes, bytesToString } from '@/utils/converters';
import { validatePinCode, validateMasterCodeIndex } from '@/utils/validation';

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
    validateMasterCodeIndex(index);
    validatePinCode(newPin);
  }

  static fromPayload(payload: Uint8Array): MasterCodeEditPacket {
    const configKey = AuthPacket.extractConfigKey(payload);
    let index = 0;
    if (payload.length > 8) {
      index = payload[8];
    }
    const newPin = bytesToString(payload.subarray(9, 15));
    return new MasterCodeEditPacket(configKey, index, newPin);
  }

  toPayload(): Uint8Array {
    const payload = new Uint8Array(8 + 1 + 6);
    payload.set(stringToBytes(this.configKey), 0);
    payload[8] = this.index;

    const pinBytes = stringToBytes(this.newPin);
    const fixedPin = new Uint8Array(6);
    fixedPin.set(pinBytes.subarray(0, 6));
    payload.set(fixedPin, 9);

    return payload;
  }
}
