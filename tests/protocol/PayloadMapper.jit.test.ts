import { describe, it, expect } from 'vitest';
import { PayloadMapper, FieldDefinition } from '../../src/protocol/decorators/PayloadMapper';
import { BoksProtocolError } from '../../src/errors/BoksProtocolError';

describe('PayloadMapper JIT & Security Tests', () => {
  describe('Security Check: isValidIdentifier', () => {

    it('should throw BoksProtocolError when invalid property name is used', () => {
      class MaliciousPacket {}
      const metadata: FieldDefinition[] = [{ propertyName: '1invalidName', type: 'uint8', offset: 0 }];
      PayloadMapper.defineSchema(MaliciousPacket, metadata);
      const payload = new Uint8Array([0x00]);
      expect(() => { PayloadMapper.parse(MaliciousPacket, payload); }).toThrowError(BoksProtocolError);
    });

    it('should throw BoksProtocolError when reserved words are used', () => {
      class ReservedPacket {}
      const metadata: FieldDefinition[] = [{ propertyName: 'return', type: 'uint8', offset: 0 }];
      PayloadMapper.defineSchema(ReservedPacket, metadata);
      const payload = new Uint8Array([0x00]);
      expect(() => { PayloadMapper.parse(ReservedPacket, payload); }).toThrowError(/Unsafe property name mapped: return/);
    });

    it('should throw BoksProtocolError when property name is empty string', () => {
      class EmptyNamePacket {}
      PayloadMapper.defineSchema(EmptyNamePacket, [{ propertyName: '', type: 'uint8', offset: 0 }]);
      expect(() => { PayloadMapper.parse(EmptyNamePacket, new Uint8Array([0x00])); }).toThrowError(/Unsafe property name/);
    });

    it('should throw BoksProtocolError when property name has invalid chars', () => {
      class SpecialCharPacket {}
      PayloadMapper.defineSchema(SpecialCharPacket, [{ propertyName: 'name-with-dash', type: 'uint8', offset: 0 }]);
      expect(() => { PayloadMapper.parse(SpecialCharPacket, new Uint8Array([0x00])); }).toThrowError(/Unsafe property name/);
    });

    it('should throw BoksProtocolError when property name includes JIT code injection', () => {
      class InjectionPacket {}
      PayloadMapper.defineSchema(InjectionPacket, [{ propertyName: 'name\']; console.log(1); //', type: 'uint8', offset: 0 }]);
      expect(() => { PayloadMapper.parse(InjectionPacket, new Uint8Array([0x00])); }).toThrowError(/Unsafe property name/);
    });
  });

  describe('Security Check: assertSafeBounds', () => {
    it('should throw BoksProtocolError when bounds are invalid', () => {
      expect(() => { PayloadMapper.assertSafeBounds(-1, 5); }).toThrowError(/Invalid mapping bounds/);
      expect(() => { PayloadMapper.assertSafeBounds(5, -1); }).toThrowError(/Invalid mapping bounds/);
      expect(() => { PayloadMapper.assertSafeBounds(5000000000, 5); }).toThrowError(/Invalid mapping bounds/);
      expect(() => { PayloadMapper.assertSafeBounds(0, 1000001); }).toThrowError(/Invalid mapping bounds/);
    });

    it('should throw BoksProtocolError during JIT when decorators define invalid bounds', () => {
      class InvalidBoundsPacket {}
      PayloadMapper.defineSchema(InvalidBoundsPacket, [{ propertyName: 'u8', type: 'uint8', offset: -1 }]);
      expect(() => { PayloadMapper.parse(InvalidBoundsPacket, new Uint8Array([0x00])); }).toThrowError(/Invalid mapping bounds/);
    });
  });

  describe('JIT Invalid Field Values (Serialization)', () => {
    it('should throw when serializing with invalid pin_code length or chars (via analyzer)', () => {
      class PinPacket { pin: string = '123'; }
      PayloadMapper.defineSchema(PinPacket, [{ propertyName: 'pin', type: 'pin_code', offset: 0 }]);

      const instance = new PinPacket();
      try { PayloadMapper.serialize(instance); } catch (e) { expect((e as any).message).toMatch(/Invalid PIN format: length must be exactly 6/i); }

      instance.pin = '12345Z';
      try { PayloadMapper.serialize(instance); } catch (e) { expect((e as any).message).toMatch(/(Invalid PIN format|PIN must contain only)/i); }
    });

    it('should throw when serializing with invalid config_key length or chars (via analyzer)', () => {
      class ConfigPacket { key: string = '123'; }
      PayloadMapper.defineSchema(ConfigPacket, [{ propertyName: 'key', type: 'config_key', offset: 0 }]);

      const instance = new ConfigPacket();
      try { PayloadMapper.serialize(instance); } catch (e) { expect((e as any).message).toMatch(/Invalid config key format: length must be exactly 8/i); }

      instance.key = 'A1B2C3Z4';
      try { PayloadMapper.serialize(instance); } catch (e) { expect((e as any).message).toMatch(/(Invalid Config Key|contain only hex)/i); }
    });

    it('should throw when serializing with missing mandatory fields', () => {
      class MissingPacket { pin!: string; key!: string; index!: number; }
      PayloadMapper.defineSchema(MissingPacket, [
        { propertyName: 'pin', type: 'pin_code', offset: 0 },
        { propertyName: 'key', type: 'config_key', offset: 6 },
        { propertyName: 'index', type: 'uint8', offset: 14 }
      ]);

      const instance = new MissingPacket();
      expect(() => { PayloadMapper.serialize(instance); }).toThrowError(/Missing mandatory field: pin/);
    });

    it('should throw when serializing null or non-object instance', () => {
      expect(() => { PayloadMapper.serialize(null); }).toThrowError(/Cannot serialize null or non-object instance/);
    });

    it('should throw when serializing object without constructor', () => {
      const obj = Object.create(null);
      expect(() => { PayloadMapper.serialize(obj); }).toThrowError(/Cannot serialize instance without constructor/);
    });
  });

  describe('JIT Validation via validate()', () => {
    it('should throw when validating with invalid pin_code length or chars', () => {
      class ValidPinPacket { pin: string = '123'; }
      PayloadMapper.defineSchema(ValidPinPacket, [{ propertyName: 'pin', type: 'pin_code', offset: 0 }]);

      const instance = new ValidPinPacket();
      expect(() => { PayloadMapper.validate(instance); }).toThrowError(/must be exactly 6 characters/i);

      instance.pin = '12345Z';
      expect(() => { PayloadMapper.validate(instance); }).toThrowError(/(Invalid PIN format|PIN must contain only)/i);
    });

    it('should throw when validating with invalid config_key length or chars', () => {
      class ValidConfigPacket { key: string = '123'; }
      PayloadMapper.defineSchema(ValidConfigPacket, [{ propertyName: 'key', type: 'config_key', offset: 0 }]);

      const instance = new ValidConfigPacket();
      expect(() => { PayloadMapper.validate(instance); }).toThrowError(/must be exactly 8 characters/i);

      instance.key = 'A1B2C3Z4';
      expect(() => { PayloadMapper.validate(instance); }).toThrowError(/(Invalid Config Key|contain only hex)/i);
    });
  });

  describe('JIT Edge Cases (Parsing)', () => {
    it('should throw when parsing with invalid payload type', () => {
      class ValidPacket {}
      PayloadMapper.defineSchema(ValidPacket, []);
      expect(() => { PayloadMapper.parse(ValidPacket, 'not-a-buffer' as any); }).toThrowError(/Payload must be a Uint8Array/);
      expect(() => { PayloadMapper.parse(ValidPacket, null as any); }).toThrowError(/Payload must be a Uint8Array/);
    });

    it('should throw when parsing with invalid targetClass', () => {
      expect(() => { PayloadMapper.parse(null as any, new Uint8Array([0x00])); }).toThrowError(/Invalid targetClass/);
    });

    it('should throw when bitIndex is invalid', () => {
      class BadBitPacket {}
      PayloadMapper.defineSchema(BadBitPacket, [{ propertyName: 'flag', type: 'bit', offset: 0, bitIndex: 8 }]);
      expect(() => { PayloadMapper.parse(BadBitPacket, new Uint8Array([0x00])); }).toThrowError(/Invalid bitIndex/);

      const instance = new BadBitPacket();
      expect(() => { PayloadMapper.serialize(instance); }).toThrowError(/Invalid bitIndex/);
    });
  });

  describe('JIT Headers and Payload Validation', () => {
    it('should throw when payload is shorter than mapped fields minimum required size', () => {
      class ShortPacket {}
      PayloadMapper.defineSchema(ShortPacket, [
        { propertyName: 'u32', type: 'uint32', offset: 0 },
        { propertyName: 'u32_2', type: 'uint32', offset: 4 } // Needs at least 8 bytes
      ]);

      const payload = new Uint8Array([0x01, 0x02, 0x03]); // only 3 bytes
      expect(() => {
        PayloadMapper.parse(ShortPacket, payload);
      }).toThrowError(/Payload too short for mapped fields/);
    });

    it('should strip header based on opcode and length byte if strictly set', () => {
      class HeaderPacket {
        static opcode = 0xAA;
        u8!: number;
      }
      PayloadMapper.defineSchema(HeaderPacket, [
        { propertyName: 'u8', type: 'uint8', offset: 0 }
      ]);

      // Header: [Opcode, Length] => minimum header size = 2. Header packet size is 3 [Opcode, length, ..., checksum]
      // expectedTotalLength = lengthByte + 3;
      // payload data starts at index 2 (PACKET_MIN_HEADER_SIZE)
      // the data length is lengthByte.
      // So if lengthByte = 1, it reads payload[2] to payload[2+1]
      const payload = new Uint8Array([0xAA, 0x01, 0xFF, 0x00]); // 0xAA (opcode), 0x01 (length of payload without headers/checksum), 0xFF (u8), 0x00 (checksum)

      const parsed = PayloadMapper.parse(HeaderPacket, payload, { strict: true });
      expect((parsed as any).u8).toBe(0xFF);
    });
  });
});

  describe('JIT Coverage Helpers', () => {
    it('should clone metadata array when inheriting from a parent', () => {
      // Testing the getOrCreateMetadata cloning logic (line ~67)
      class ParentPacket {
        u8!: number;
      }
      PayloadMapper.defineSchema(ParentPacket, [{ propertyName: 'u8', type: 'uint8', offset: 0 }]);

      class ChildPacket extends ParentPacket {
        u16!: number;
      }
      PayloadMapper.defineSchema(ChildPacket, [{ propertyName: 'u16', type: 'uint16', offset: 1 }]);


      const p = PayloadMapper.parse(ChildPacket, new Uint8Array([0x01, 0x02, 0x03]));
      expect((p as any).u8).toBe(0x01);
      expect((p as any).u16).toBe(0x0203);
    });
  });

  describe('JIT Coverage Helpers (Decorators metadata)', () => {
    it('should clone metadata array when inheriting from a parent via getOrCreateMetadata', () => {
      // Test the getOrCreateMetadata helper directly since it's hard to trigger directly without TS decorators plugin locally
      const mockContextBase: any = {
        metadata: {}
      };


      import('../../src/protocol/decorators/PayloadMapper').then(m => {
        const getOrCreateMetadata = m.getOrCreateMetadata;

        // 1st call creates it
        const baseMeta = getOrCreateMetadata(mockContextBase);
        expect(baseMeta).toEqual([]);
        baseMeta.push({ propertyName: 'base', type: 'uint8', offset: 0 } as any);

        // 2nd call inherits it
        const mockContextChild: any = {
          metadata: Object.create(mockContextBase.metadata)
        };
        const childMeta = getOrCreateMetadata(mockContextChild);
        expect(childMeta).toEqual([{ propertyName: 'base', type: 'uint8', offset: 0 }]);
        expect(childMeta).not.toBe(baseMeta); // Must be a clone
      });
    });
  });

describe('PayloadMapper JIT Coverage Extras', () => {
  describe('getOrCreateMetadata (no metadata property)', () => {
    it('returns empty array when context.metadata is undefined', async () => {
      const mockContext: any = {};
      const { getOrCreateMetadata } = await import('../../src/protocol/decorators/PayloadMapper');
      const result = getOrCreateMetadata(mockContext);
      expect(result).toEqual([]);
    });
  });

  describe('compileParser (dynamic size hex_string vs byte_array)', () => {
    it('handles byte_array and hex_string dynamically when length is not specified', () => {
      class DynPacket {
        ba!: Uint8Array;
        hs!: string;
      }
      PayloadMapper.defineSchema(DynPacket, [
        { propertyName: 'ba', type: 'byte_array', offset: 0 },
        { propertyName: 'hs', type: 'hex_string', offset: 2 }
      ]);
      const parsed = PayloadMapper.parse<DynPacket>(DynPacket, new Uint8Array([0x01, 0x02, 0x03, 0x04]));
      expect(parsed.ba).toBeInstanceOf(Uint8Array);
      expect(parsed.hs).toBe('0304');
    });
  });
});
