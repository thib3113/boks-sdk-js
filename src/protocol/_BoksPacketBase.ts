import { BoksOpcode, EMPTY_BUFFER } from '@/protocol/constants';
import { PayloadMapper } from '@/protocol/payload-mapper';
import { calculateChecksum, bytesToHex } from '@/utils/converters';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import {
  validatePinCode,
  validateNfcUid,
  validateConfigKeyFormat,
  validateSeed
} from '@/utils/validation';

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
  protected rawPayload: Uint8Array = EMPTY_BUFFER;

  abstract get opcode(): BoksOpcode;
  toPayload(): Uint8Array {
    return PayloadMapper.serialize(this);
  }

  /**
   * Static factory method to create an instance from a payload.
   * This MUST be implemented by leaf classes for strict parsing.
   */
  static fromPayload(_payload: Uint8Array): BoksPacket {
    throw new BoksProtocolError(BoksProtocolErrorId.MALFORMED_DATA, 'fromPayload not implemented');
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

  /**
   * Validates and formats a PIN code as an uppercase string.
   */
  protected formatPin(pin: string): string {
    validatePinCode(pin);
    return pin.toUpperCase();
  }

  /**
   * Validates and formats an NFC UID as an uppercase string.
   */
  protected formatNfcUid(uid: string): string {
    validateNfcUid(uid);
    return uid.replace(/:/g, '').toUpperCase();
  }

  /**
   * Validates and formats a Config Key as an uppercase string.
   */
  protected formatConfigKey(key: string): string {
    validateConfigKeyFormat(key);
    return key.toUpperCase();
  }

  /**
   * Validates and formats a Master Key / Seed as an uppercase hex string.
   * Handles both string and Uint8Array inputs.
   */
  protected formatSeed(seed: Uint8Array | string): string {
    validateSeed(seed);
    if (typeof seed === 'string') {
      return seed.toUpperCase();
    } else {
      return bytesToHex(seed).toUpperCase();
    }
  }
}
