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

  /**
   * Default factory implementation for RX packets.
   * Instantiates the packet and parses the payload.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromPayload(payload: Uint8Array): any {
    // @ts-expect-error: Instantiate the subclass
    const packet = new this();
    packet.parse(payload);
    return packet;
  }
}
