import { BoksOpcode, EMPTY_BUFFER, PACKET_HEADER_SIZE } from '@/protocol/constants';
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
  readonly lengthIncludesHeader?: boolean;
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
  #extractedPayloadCache?: Uint8Array;

  constructor(rawPayload?: Uint8Array) {
    this.#rawPayload = rawPayload;
  }

  /**
   * Represents the raw bytes of the packet.
   * If instantiated from a received buffer, this contains the full packet (Opcode + Len + Payload + CRC).
   */
  get rawPayload(): Uint8Array {
    return this.#rawPayload ?? EMPTY_BUFFER;
  }

  /**
   * The data part of the packet (excluding opcode, length byte, and checksum).
   * Cached after first extraction for performance.
   */
  get payload(): Uint8Array {
    if (this.#extractedPayloadCache) {
      return this.#extractedPayloadCache;
    }

    if (this.#rawPayload && this.#rawPayload.length >= PACKET_HEADER_SIZE) {
      // If it looks like a full packet (starts with our opcode), extract the data part
      if (this.#rawPayload[0] === this.opcode) {
        const lengthIncludesHeader = (this.constructor as unknown as BoksPacketConstructor).lengthIncludesHeader ?? false;
        this.#extractedPayloadCache = BoksPacket.extractPayloadData(this.#rawPayload, lengthIncludesHeader);
        return this.#extractedPayloadCache;
      }
    }
    
    // Fallback: it might already be just a payload
    this.#extractedPayloadCache = this.#rawPayload ?? EMPTY_BUFFER;
    return this.#extractedPayloadCache;
  }

  /**
   * Helper to extract the data payload from a full packet buffer.
   */
  static extractPayloadData(data: Uint8Array, lengthIncludesHeader: boolean = false): Uint8Array {
    if (data.length < PACKET_HEADER_SIZE) return data;
    const lengthByte = data[1];
    const payloadLength = lengthIncludesHeader ? lengthByte - PACKET_HEADER_SIZE : lengthByte;
    return data.subarray(2, 2 + payloadLength);
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
   * Serializes the packet to a plain JSON object.
   * Includes the opcode and all properties mapped by decorators.
   */
  toJSON(): BoksPacketJSON<this> {
    const fields = PayloadMapper.getFields(this.constructor);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = { opcode: this.opcode };

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = (this as any)[field.propertyName];
      if (value !== undefined) {
        result[field.propertyName] = value;
      }
    }

    return result as BoksPacketJSON<this>;
  }

  /**
   * Encodes the full packet: [Opcode, Length, ...Payload, Checksum]
   */
  encode(): Uint8Array {
    const payload = this.toPayload();
    const lengthIncludesHeader =
      (this.constructor as unknown as BoksPacketConstructor).lengthIncludesHeader ?? false;

    const packet = new Uint8Array(payload.length + PACKET_HEADER_SIZE);
    packet[0] = this.opcode;
    packet[1] = lengthIncludesHeader ? payload.length + PACKET_HEADER_SIZE : payload.length;
    packet.set(payload, 2);
    packet[packet.length - 1] = calculateChecksum(packet, 0, packet.length - 1);
    return packet;
  }
}
