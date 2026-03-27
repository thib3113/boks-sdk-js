import { BoksPacket } from '../_BoksPacketBase';
import { BoksOpcode } from '../constants';

export class UnknownPacket extends BoksPacket {
  readonly #dynamicOpcode: number;
  private readonly _payload: Uint8Array;

  constructor(opcode: number, payload: Uint8Array) {
    super(payload);
    this.#dynamicOpcode = opcode;
    this._payload = payload;
  }

  get opcode(): BoksOpcode {
    return this.#dynamicOpcode as BoksOpcode;
  }

  get payload(): Uint8Array {
    return this._payload;
  }

  toPayload(): Uint8Array {
    return this._payload;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toJSON(): any {
    return {
      opcode: this.opcode,
      payload: this._payload
    };
  }

  static fromPayload(_payload: Uint8Array): UnknownPacket {
    throw new Error('Use fromUnknownPayload instead');
  }

  static fromUnknownPayload(opcode: number, payload: Uint8Array): UnknownPacket {
    return new UnknownPacket(opcode, payload);
  }
}
