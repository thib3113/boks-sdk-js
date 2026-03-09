import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { writeConfigKeyToBuffer, readPinFromBuffer, writePinToBuffer } from '@/utils/converters';
import { validateMasterCodeIndex } from '@/utils/validation';

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
    this.newPin = this.formatPin(newPin);
  }

  static fromPayload(payload: Uint8Array): MasterCodeEditPacket {
    const configKey = AuthPacket.extractConfigKey(payload);
    let index = 0;
    if (payload.length > 8) {
      index = payload[8];
    }
    const newPin = readPinFromBuffer(payload, 9);
    return new MasterCodeEditPacket(configKey, index, newPin);
  }

  toPayload(): Uint8Array {
    const payload = new Uint8Array(8 + 1 + 6);
    writeConfigKeyToBuffer(payload, 0, this.configKey);
    payload[8] = this.index;

    writePinToBuffer(payload, 9, this.newPin);

    return payload;
  }
}
