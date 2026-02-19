import { BoksOpcode } from '@/protocol/constants';
import { calculateChecksum } from '@/utils/converters';

/**
 * Type representing a BoksPacket constructor.
 */
export type BoksPacketConstructor<T extends BoksPacket = BoksPacket> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
  readonly opcode: BoksOpcode;
  fromPayload(payload: Uint8Array): T;
};

/**
 * Base class for all Boks packets
 */
export abstract class BoksPacket {
  protected rawPayload: Uint8Array = new Uint8Array(0);

  abstract get opcode(): BoksOpcode;
  abstract toPayload(): Uint8Array;

  /**
   * Static factory method to create an instance from a payload.
   * This MUST be implemented by leaf classes for strict parsing.
   */
  static fromPayload(_payload: Uint8Array): BoksPacket {
    throw new Error('fromPayload not implemented');
  }

  /**
   * Encodes the full packet: [Opcode, Length, ...Payload, Checksum]
   */
  encode(): Uint8Array {
    const payload = this.toPayload();
    const packet = new Uint8Array(payload.length + 3);
    packet[0] = this.opcode;
    packet[1] = payload.length;
    packet.set(payload, 2);
    packet[packet.length - 1] = calculateChecksum(packet.subarray(0, packet.length - 1));
    return packet;
  }
}
