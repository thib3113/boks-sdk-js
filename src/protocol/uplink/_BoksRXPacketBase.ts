import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';

/**
 * Base class for all Boks RX packets (notifications).
 */
export abstract class BoksRXPacket extends BoksPacket {
  constructor(
    protected readonly _opcode: BoksOpcode,
    protected readonly _rawPayload?: Uint8Array
  ) {
    super(_rawPayload);
  }

  get opcode() {
    return this._opcode;
  }

  /**
   * For RX packets, toPayload returns the raw payload received.
   */
  toPayload() {
    /* v8 ignore next */
    return this.rawPayload ?? EMPTY_BUFFER;
  }
}
