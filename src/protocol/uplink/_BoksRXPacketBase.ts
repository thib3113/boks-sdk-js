import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Base class for all Boks RX packets (notifications).
 */
export abstract class BoksRXPacket extends BoksPacket {
  constructor(protected readonly _opcode: BoksOpcode) {
    super();
  }

  get opcode() {
    return this._opcode;
  }

  /**
   * For RX packets, toPayload returns the raw payload received.
   */
  toPayload() {
    return this.rawPayload;
  }
}


