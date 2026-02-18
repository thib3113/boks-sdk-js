import { BoksRXPacket } from '@/protocol/uplink/_BoksRXPacketBase';
import { BoksOpcode } from '@/protocol/constants';

/**
 * Base class for all Boks History Event packets.
 */
export abstract class BoksHistoryEvent extends BoksRXPacket {
  public age: number = 0;

  constructor(opcode: BoksOpcode) {
    super(opcode);
  }

  /**
   * Parses the common history header (Age: 3 bytes Big Endian).
   */
  protected parseHistoryHeader(payload: Uint8Array): void {
    super.parse(payload);
    if (payload.length >= 3) {
      // Big Endian 24-bit
      this.age = (payload[0] << 16) | (payload[1] << 8) | payload[2];
    }
  }

  /**
   * Default implementation of parse just parses the header.
   */
  parse(payload: Uint8Array): void {
    this.parseHistoryHeader(payload);
  }
}
