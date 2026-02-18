import { AuthPacket } from '@/protocol/downlink/_AuthPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes } from '@/utils/converters';

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


