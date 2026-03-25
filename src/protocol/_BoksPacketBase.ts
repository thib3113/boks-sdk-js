import { BoksOpcode, EMPTY_BUFFER, PACKET_HEADER_SIZE, PACKET_MIN_HEADER_SIZE, CHECKSUM_MASK } from '@/protocol/constants';
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
  fromRaw(raw: Uint8Array): T;
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
  #raw?: Uint8Array;
  #extractedPayloadCache?: Uint8Array;
  #checksumCache: boolean | null | undefined = undefined;

  constructor(raw?: Uint8Array) {
    this.#raw = raw;
  }

  /**
   * The validity status of the packet's checksum.
   *
   * - `true`: The checksum is valid and matches the data.
   * - `false`: The checksum is invalid (data corruption or malformed packet).
   * - `null`: The checksum could not be validated (e.g., partial packet, opcode mismatch, or packet created manually without raw bytes).
   *
   * Computed lazily on first access.
   */
  get validChecksum(): boolean | null {
    if (this.#checksumCache !== undefined) {
      return this.#checksumCache;
    }

    if (!this.#raw || this.#raw.length < PACKET_HEADER_SIZE) {
      this.#checksumCache = null;
      return null;
    }

    this.#checksumCache = BoksPacket.validateChecksum(
      this.#raw,
      this.opcode,
      this.lengthIncludesHeader
    );
    return this.#checksumCache;
  }

  /**
   * The complete raw bytes of the packet (Opcode + Length + Payload + CRC).
   */
  get raw(): Uint8Array {
    return this.#raw ?? EMPTY_BUFFER;
  }

  private get lengthIncludesHeader(): boolean {
    return (this.constructor as unknown as BoksPacketConstructor).lengthIncludesHeader ?? false;
  }

  /**
   * The data part of the packet (excluding opcode, length byte, and checksum).
   * Cached after first extraction for performance.
   */
  get payload(): Uint8Array {
    if (this.#extractedPayloadCache) {
      return this.#extractedPayloadCache;
    }

    if (this.#raw && this.#raw.length >= PACKET_HEADER_SIZE) {
      if (this.#raw[0] === this.opcode) {
        this.#extractedPayloadCache = BoksPacket.extractPayloadData(
          this.#raw,
          this.opcode,
          this.lengthIncludesHeader
        );
        return this.#extractedPayloadCache;
      }
    }

    // Fallback if not a full packet
    this.#extractedPayloadCache = this.#raw ?? EMPTY_BUFFER;
    return this.#extractedPayloadCache;
  }

  static validateChecksum(
    data: Uint8Array,
    opcode: BoksOpcode,
    lengthIncludesHeader: boolean = false
  ): boolean | null {
    if (data.length < PACKET_HEADER_SIZE) {
      return null;
    }

    // Check if the first byte matches the opcode.
    // If it doesn't match, we can't reliably validate the checksum for THIS packet type.
    if (data[0] !== opcode) {
      return null;
    }

    const lengthByte = data[1];
    const expectedTotalLength = lengthIncludesHeader ? lengthByte : lengthByte + PACKET_HEADER_SIZE;

    if (data.length >= expectedTotalLength) {
      let computed = 0;
      for (let i = 0; i < expectedTotalLength - 1; i++) {
        computed = (computed + data[i]) & CHECKSUM_MASK;
      }
      return data[expectedTotalLength - 1] === computed;
    }

    return null;
  }

  static extractPayloadData(
    data: Uint8Array,
    opcode: BoksOpcode,
    lengthIncludesHeader: boolean = false
  ): Uint8Array {
    if (data.length < PACKET_HEADER_SIZE || data[0] !== opcode) {
      return data;
    }

    const lengthByte = data[1];
    const payloadLength = lengthIncludesHeader ? lengthByte - PACKET_HEADER_SIZE : lengthByte;
    const start = PACKET_MIN_HEADER_SIZE;
    const end = start + payloadLength;

    if (data.length >= end) {
      return data.subarray(start, end);
    }

    return data;
  }

  abstract get opcode(): BoksOpcode;

  toPayload(): Uint8Array {
    return PayloadMapper.serialize(this);
  }

  /**
   * Static factory method to create an instance from a full raw packet.
   * This MUST be implemented by leaf classes for strict parsing.
   */
  /* v8 ignore next 3 */
  static fromRaw(_raw: Uint8Array): BoksPacket {
    throw new BoksProtocolError(BoksProtocolErrorId.NOT_IMPLEMENTED, 'fromRaw not implemented');
  }

  /**
   * Serializes the packet to a plain JSON object.
   * Includes the opcode and all properties mapped by decorators.
   */
  toJSON(): BoksPacketJSON<this> & { validChecksum: boolean | null } {
    const fields = PayloadMapper.getFields(this.constructor);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {
      opcode: this.opcode,
      validChecksum: this.validChecksum
    };

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = (this as any)[field.propertyName];
      if (value !== undefined) {
        result[field.propertyName] = value;
      }
    }

    return result as BoksPacketJSON<this> & { validChecksum: boolean | null };
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
    packet.set(payload, PACKET_MIN_HEADER_SIZE);
    packet[packet.length - 1] = calculateChecksum(packet, 0, packet.length - 1);
    return packet;
  }
}
