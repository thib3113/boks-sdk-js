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
export type BoksPacketJSON<T> = {
  opcode: BoksOpcode;
} & {
  [K in keyof Omit<T, keyof BoksPacket>]: T[K];
};

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
   * Serializes the packet to a plain JSON object.
   * Includes the opcode and all properties mapped by decorators.
   */
  toJSON(): BoksPacketJSON<this> {
    const fields = PayloadMapper.getFields(this.constructor);
    const result: any = { opcode: this.opcode };

    for (const field of fields) {
      if (field.propertyName in this) {
        result[field.propertyName] = (this as any)[field.propertyName];
      }
    }

    return result as BoksPacketJSON<this>;
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
