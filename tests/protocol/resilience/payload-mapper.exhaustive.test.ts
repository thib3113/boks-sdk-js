import { describe, it, expect } from 'vitest';
import {
  PayloadMapper,
  PayloadByteArray,
  PayloadHexString,
  PayloadVarLenHex,
  PayloadBit,
  PayloadAsciiString
} from '@/protocol/payload-mapper';
import { BoksProtocolError } from '@/errors/BoksProtocolError';

class DummyDynamicLengthPacket {
  @PayloadHexString(0)
  public accessor remainingHex!: string;
}

class DummyDynamicByteArrayPacket {
  @PayloadByteArray(0)
  public accessor remainingBytes!: Uint8Array;
}

class DummyVarLenHexPacket {
  @PayloadVarLenHex(0)
  public accessor varHex!: string;
}

class DummyBitPacket {
  @PayloadBit(0, 3)
  public accessor flag!: boolean;
}

describe('PayloadMapper Exhaustive Deterministic Tests', () => {
  describe('Missing Decorator Coverage (Uncovered Lines)', () => {
    it('should correctly parse and serialize dynamic length hex string', () => {
      const payload = new Uint8Array([0xAA, 0xBB, 0xCC]);
      const parsed = PayloadMapper.parse(DummyDynamicLengthPacket, payload);
      expect(parsed.remainingHex).toBe('AABBCC');

      const serialized = PayloadMapper.serialize(new DummyDynamicLengthPacket());
      expect(serialized).toBeInstanceOf(Uint8Array); // Default empty instantiation fallback check

      const instance = new DummyDynamicLengthPacket();
      instance.remainingHex = 'AABBCC';
      const serialized2 = PayloadMapper.serialize(instance);
      expect(serialized2).toEqual(new Uint8Array([0xAA, 0xBB, 0xCC]));
    });

    it('should correctly parse and serialize dynamic length byte array', () => {
      const payload = new Uint8Array([0xAA, 0xBB, 0xCC]);
      const parsed = PayloadMapper.parse(DummyDynamicByteArrayPacket, payload);
      expect(parsed.remainingBytes).toEqual(new Uint8Array([0xAA, 0xBB, 0xCC]));

      const instance = new DummyDynamicByteArrayPacket();
      instance.remainingBytes = new Uint8Array([0xAA, 0xBB, 0xCC]);
      const serialized = PayloadMapper.serialize(instance);
      expect(serialized).toEqual(new Uint8Array([0xAA, 0xBB, 0xCC]));
    });

    it('should cleanly fallback to zero-length when dynamic fields are empty on serialization', () => {
      const emptyHex = new DummyDynamicLengthPacket();
      emptyHex.remainingHex = '';
      expect(PayloadMapper.serialize(emptyHex).length).toBe(0);

      const emptyBytes = new DummyDynamicByteArrayPacket();
      // Uninitialized remainingBytes
      expect(PayloadMapper.serialize(emptyBytes).length).toBe(0);

      const varLen = new DummyVarLenHexPacket();
      // Uninitialized varHex
      expect(PayloadMapper.serialize(varLen)).toEqual(new Uint8Array([0x00]));
    });

    it('should safely serialize and parse var_len_hex', () => {
      const instance = new DummyVarLenHexPacket();
      instance.varHex = 'AABBCC';
      const serialized = PayloadMapper.serialize(instance);
      expect(serialized).toEqual(new Uint8Array([0x03, 0xAA, 0xBB, 0xCC]));

      const parsed = PayloadMapper.parse(DummyVarLenHexPacket, serialized);
      expect(parsed.varHex).toBe('AABBCC');
    });

    it('should throw MALFORMED_DATA on short var_len_hex parse', () => {
      const payload = new Uint8Array([0x05, 0xAA, 0xBB]); // Length says 5, but only 2 bytes available
      expect(() => PayloadMapper.parse(DummyVarLenHexPacket, payload)).toThrowError(BoksProtocolError);
    });

    it('should serialize and parse bits cleanly', () => {
      const trueInstance = new DummyBitPacket();
      trueInstance.flag = true;
      expect(PayloadMapper.serialize(trueInstance)).toEqual(new Uint8Array([0x08])); // 1 << 3

      const falseInstance = new DummyBitPacket();
      falseInstance.flag = false;
      expect(PayloadMapper.serialize(falseInstance)).toEqual(new Uint8Array([0x00]));

      const parsed = PayloadMapper.parse(DummyBitPacket, new Uint8Array([0x08]));
      expect(parsed.flag).toBe(true);
    });

    it('should set schema on Symbol.metadata if available during defineSchema', () => {
        class MockClass {}
        (MockClass as any)[Symbol.metadata] = {};
        PayloadMapper.defineSchema(MockClass, [{ propertyName: 'foo', type: 'uint8', offset: 0 }]);
        expect((MockClass as any)[Symbol.metadata][Symbol.for('BoksPayloadMapper')]).toBeDefined();
    });

    it('should throw an error on PayloadAsciiString when missing length parameter definition (Internal guard)', () => {
        expect(() => {
             // Mock an internal configuration error where someone bypassed TS for ascii string decorator
             class BadConfig {
                 @PayloadAsciiString(0, undefined as any)
                 public accessor text!: string;
             }
             PayloadMapper.parse(BadConfig, new Uint8Array([0x00]));
        }).toThrowError(BoksProtocolError);
    });

    it('should serialize to empty buffer when no fields are mapped', () => {
        class NoFieldsPacket {}
        const serialized = PayloadMapper.serialize(new NoFieldsPacket());
        expect(serialized).toEqual(new Uint8Array(0));
    });
  });
});
