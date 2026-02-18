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
   * @returns The offset after the age field (3).
   */
  protected parseHistoryHeader(payload: Uint8Array): number {
    super.parse(payload);
    if (payload.length >= 3) {
      // Big Endian 24-bit
      this.age = (payload[0] << 16) | (payload[1] << 8) | payload[2];
      return 3;
    }
    return 0;
  }

  /**
   * Default implementation of parse just parses the header.
   */
  parse(payload: Uint8Array): number {
    return this.parseHistoryHeader(payload);
  }
}
