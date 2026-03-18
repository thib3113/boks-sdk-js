import { describe, it, expect } from 'vitest';
import { PayloadMapper } from '../../src/protocol/decorators/PayloadMapper';
import { BoksProtocolError } from '../../src/errors/BoksProtocolError';

class HackerClass {}

describe('PayloadMapper JIT Compiler Security Tests', () => {

  describe('Property Name Injection', () => {
    it('should reject property names that attempt to break out of string literals', () => {
      const maliciousNames = [
        "a'; console.log('HACKED'); //",
        "prop\" + console.log('HACKED')",
        "test\\nconsole.log(1)",
        "eval('alert(1)')",
        "1test", // Cannot start with number
        "a b",   // No spaces
        "a-b",   // No hyphens
      ];

      for (const name of maliciousNames) {
        PayloadMapper.defineSchema(HackerClass, [
          { propertyName: name, type: 'uint8', offset: 0 }
        ]);

        expect(() => {
          PayloadMapper.parse(HackerClass, new Uint8Array([1]));
        }).toThrow(BoksProtocolError);

        expect(() => {
          PayloadMapper.parse(HackerClass, new Uint8Array([1]));
        }).toThrow(/Unsafe property name/);
      }
    });

    it('should reject exact dangerous property names', () => {
      const dangerous = ['__proto__', 'constructor', 'prototype', 'HEX_TABLE', 'BoksProtocolError'];

      for (const name of dangerous) {
        PayloadMapper.defineSchema(HackerClass, [
          { propertyName: name, type: 'uint8', offset: 0 }
        ]);

        expect(() => {
          PayloadMapper.parse(HackerClass, new Uint8Array([1]));
        }).toThrow(/Unsafe property name/);
      }
    });

    it('should safely process allowed weird but valid identifiers', () => {
      PayloadMapper.defineSchema(HackerClass, [
        { propertyName: "__defineGetter__", type: 'uint8', offset: 0 },
        { propertyName: "$$", type: 'uint8', offset: 1 }
      ]);
      const res = PayloadMapper.parse(HackerClass, new Uint8Array([42, 43])) as any;
      expect(res.__defineGetter__).toBe(42);
      expect(res.$$).toBe(43);
    });
  });

  describe('Length and Bounds Injection', () => {
    it('should reject ascii_string with malicious string length injection', () => {
      PayloadMapper.defineSchema(HackerClass, [
        { propertyName: "prop", type: 'ascii_string', offset: 0, length: "1; console.log('HACKED');" as any }
      ]);
      expect(() => {
        PayloadMapper.parse(HackerClass, new Uint8Array([1]));
      }).toThrow(/Length required for string type/);
    });

    it('should reject hex_string with malicious string length injection by falling back to dynamic size without crash or eval', () => {
      PayloadMapper.defineSchema(HackerClass, [
        { propertyName: "prop", type: 'hex_string', offset: 0, length: "1; console.log('HACKED');" as any }
      ]);
      // If length is not a number, hex_string reads to end of payload
      const res = PayloadMapper.parse(HackerClass, new Uint8Array([0xAA, 0xBB])) as any;
      expect(res.prop).toBe('AABB');
    });

    it('should reject Object containing valueOf or toString overrides in length', () => {
      let executed = false;
      PayloadMapper.defineSchema(HackerClass, [
        { propertyName: "prop", type: 'ascii_string', offset: 0, length: { valueOf: () => { executed = true; return 1; } } as any }
      ]);
      expect(() => {
        PayloadMapper.parse(HackerClass, new Uint8Array([1]));
      }).toThrow(/Length required for string type/);
      expect(executed).toBe(false);
    });

    it('should reject invalid length values causing infinite loops', () => {
      PayloadMapper.defineSchema(HackerClass, [
        { propertyName: "prop", type: 'ascii_string', offset: 0, length: Infinity }
      ]);
      expect(() => {
        PayloadMapper.parse(HackerClass, new Uint8Array([1]));
      }).toThrow(/Invalid mapping bounds/);

      PayloadMapper.defineSchema(HackerClass, [
        { propertyName: "prop2", type: 'ascii_string', offset: 0, length: NaN }
      ]);
      expect(() => {
        PayloadMapper.parse(HackerClass, new Uint8Array([1]));
      }).toThrow(/Invalid mapping bounds/);
    });
  });

  describe('Offset and BitIndex Injection', () => {
    it('should reject invalid offset injections', () => {
      const invalidOffsets = [
        "0; console.log('HACKED');//" as any,
        -1,
        1025,
        NaN,
        Infinity,
        1.5
      ];

      for (const offset of invalidOffsets) {
        PayloadMapper.defineSchema(HackerClass, [
          { propertyName: "prop", type: 'uint8', offset: offset }
        ]);

        expect(() => {
          PayloadMapper.parse(HackerClass, new Uint8Array([1]));
        }).toThrow(/Invalid mapping bounds/);
      }
    });

    it('should reject invalid bitIndex injections', () => {
      PayloadMapper.defineSchema(HackerClass, [
        { propertyName: "prop", type: 'bit', offset: 0, bitIndex: "1); console.log('HACKED3');//" as any }
      ]);
      expect(() => {
        PayloadMapper.parse(HackerClass, new Uint8Array([1]));
      }).toThrow(/Invalid bitIndex/);

      PayloadMapper.defineSchema(HackerClass, [
        { propertyName: "prop2", type: 'bit', offset: 0, bitIndex: 8 }
      ]);
      expect(() => {
        PayloadMapper.parse(HackerClass, new Uint8Array([1]));
      }).toThrow(/Invalid bitIndex/);

      PayloadMapper.defineSchema(HackerClass, [
        { propertyName: "prop3", type: 'bit', offset: 0, bitIndex: -1 }
      ]);
      expect(() => {
        PayloadMapper.parse(HackerClass, new Uint8Array([1]));
      }).toThrow(/Invalid bitIndex/);
    });
  });

  describe('Unrecognized Field Types', () => {
    it('should safely ignore unrecognized field types in the switch block', () => {
      PayloadMapper.defineSchema(HackerClass, [
        { propertyName: "prop", type: "malicious_type_injection" as any, offset: 0 }
      ]);
      const res = PayloadMapper.parse(HackerClass, new Uint8Array([1])) as any;
      // It returns an object without `prop` because type was ignored
      expect(res.prop).toBeUndefined();
    });
  });

  describe('Serialization Safety', () => {
    it('should not evaluate dynamic code when serializing object properties', () => {
      PayloadMapper.defineSchema(HackerClass, [
        { propertyName: "prop", type: 'ascii_string', offset: 0, length: 5 }
      ]);

      const instance = new HackerClass() as any;
      // Object that returns something weird for charCodeAt
      instance.prop = {
        length: 5,
        charCodeAt: () => { throw new Error('Hack executed'); }
      };

      // Serialization calls String(instance['prop']) which evaluates to "[object Object]"
      // It then takes charCodeAt of "[object Object]" which works normally (returns 91 for '[', etc.)
      const buf = PayloadMapper.serialize(instance);
      // '[' is 91, 'o' is 111, 'b' is 98, 'j' is 106, 'e' is 101
      expect(Array.from(buf)).toEqual([91, 111, 98, 106, 101]);
    });

    it('should not be vulnerable to prototype pollution when generating payload size', () => {
      PayloadMapper.defineSchema(HackerClass, [
        { propertyName: "varhex", type: 'var_len_hex', offset: 0 }
      ]);

      const instance = new HackerClass() as any;
      // Normal length string
      instance.varhex = "AABB";

      const buf = PayloadMapper.serialize(instance);
      expect(buf[0]).toBe(2); // Length 2 bytes
      expect(buf[1]).toBe(0xAA);
      expect(buf[2]).toBe(0xBB);

      // Extremely long string that could be malicious
      instance.varhex = "A".repeat(100000); // 50000 bytes long
      const largeBuf = PayloadMapper.serialize(instance);
      expect(largeBuf.length).toBe(1 + 50000);
    });
  });

});
