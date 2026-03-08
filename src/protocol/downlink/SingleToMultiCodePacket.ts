import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { writeConfigKeyToBuffer, bytesToString, writePinToBuffer } from '@/utils/converters';

/**
 * Command to convert a Single-Use code to Multi-Use.
 */
export class SingleToMultiCodePacket extends AuthPacket {
  static readonly opcode = BoksOpcode.SINGLE_USE_CODE_TO_MULTI;
  get opcode() {
    return SingleToMultiCodePacket.opcode;
  }

  constructor(
    configKey: string,
    public readonly pin: string
  ) {
    super(configKey);
    this.pin = this.formatPin(pin);
  }

  static fromPayload(payload: Uint8Array): SingleToMultiCodePacket {
    const configKey = AuthPacket.extractConfigKey(payload);
    const pin = bytesToString(payload.subarray(8, 14));
    return new SingleToMultiCodePacket(configKey, pin);
  }

  toPayload(): Uint8Array {
    const payload = new Uint8Array(8 + 6);
    writeConfigKeyToBuffer(payload, 0, this.configKey);

    writePinToBuffer(payload, 8, this.pin);

    return payload;
  }
}
