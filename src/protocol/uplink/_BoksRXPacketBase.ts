import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { PayloadMapper } from '@/protocol/decorators';

/**
 * Base class for all Boks RX packets (notifications).
 */
export abstract class BoksRXPacket extends BoksPacket {
  constructor(
    protected readonly _opcode: BoksOpcode,
    protected readonly _raw?: Uint8Array
  ) {
    super(_raw);
  }

  get opcode() {
    return this._opcode;
  }

  /**
   * For RX packets, toPayload returns the raw payload received.
   * If not available (e.g. created for simulator/testing), it serializes the packet.
   */
  toPayload() {
    if (this.raw && this.raw.length > 0) {
      return this.raw;
    }
    return PayloadMapper.serialize(this);
  }
}
