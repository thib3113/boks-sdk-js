import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { writeConfigKeyToBuffer, readPinFromBuffer, writePinToBuffer } from '@/utils/converters';
import { validateMasterCodeIndex } from '@/utils/validation';

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
    validateMasterCodeIndex(index);
    this.pin = this.formatPin(pin);
  }

  static fromPayload(payload: Uint8Array): CreateMasterCodePacket {
    const configKey = AuthPacket.extractConfigKey(payload);
    const pin = readPinFromBuffer(payload, 8);
    let index = 0;
    if (payload.length > 14) {
      index = payload[14];
    }
    return new CreateMasterCodePacket(configKey, index, pin);
  }

  toPayload(): Uint8Array {
    const payload = new Uint8Array(8 + 6 + 1);
    writeConfigKeyToBuffer(payload, 0, this.configKey);

    writePinToBuffer(payload, 8, this.pin);

    payload[14] = this.index;
    return payload;
  }
}
