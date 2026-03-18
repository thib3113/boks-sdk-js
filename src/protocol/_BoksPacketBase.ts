import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';
import { PayloadMapper } from '@/protocol/decorators';
import { calculateChecksum } from '@/utils/converters';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';

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
  #rawPayload?: Uint8Array;

  constructor(rawPayload?: Uint8Array) {
    this.#rawPayload = rawPayload;
  }

  get rawPayload(): Uint8Array {
    return this.#rawPayload ?? EMPTY_BUFFER;
  }

  abstract get opcode(): BoksOpcode;
  toPayload(): Uint8Array {
    return PayloadMapper.serialize(this);
  }

  /**
   * Static factory method to create an instance from a payload.
   * This MUST be implemented by leaf classes for strict parsing.
   */
  /* v8 ignore next 3 */
  static fromPayload(_payload: Uint8Array): BoksPacket {
    throw new BoksProtocolError(BoksProtocolErrorId.NOT_IMPLEMENTED, 'fromPayload not implemented');
  }

  /**
   * Encodes the full packet: [Opcode, Length, ...Payload, Checksum]
   */

  /**
   * Returns a JSON representation of the packet, including all properties (including getters).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toJSON(): Record<string, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsonObj: Record<string, any> = {};
    const proto = Object.getPrototypeOf(this);

    // Get all property names and getters from the instance and its prototype
    const propertyNames = Object.getOwnPropertyNames(this);
    const protoPropertyNames = Object.getOwnPropertyNames(proto);

    // Filter out internal properties or methods
    const allNames = [...new Set([...propertyNames, ...protoPropertyNames])].filter((name) => {
      return (
        name !== 'constructor' &&
        name !== 'rawPayload' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof (this as any)[name] !== 'function'
      );
    });

    for (const name of allNames) {
      if (name.startsWith('#')) {
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const val = (this as any)[name];
      if (val instanceof Uint8Array) {
        // Convert Uint8Array to an array or hex string for JSON serialization
        jsonObj[name] = Array.from(val)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      } else {
        jsonObj[name] = val;
      }
    }

    return jsonObj;
  }

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
