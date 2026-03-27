import { describe, expect, it } from 'vitest';
import { PayloadAnalyzer } from '../../src/protocol/decorators/PayloadAnalyzer';
import { BoksProtocolError } from '../../src/errors/BoksProtocolError';

describe('PayloadAnalyzer Comprehensive Coverage', () => {
  const analyzer = new PayloadAnalyzer();

  describe('read methods', () => {
    it('readUint8', () => {
      const payload = new Uint8Array([0x00, 0x1A, 0xFF]);
      expect(analyzer.readUint8(payload, 1)).toBe(0x1A);
    });

    it('readUint16', () => {
      const payload = new Uint8Array([0x00, 0x12, 0x34, 0x00]);
      expect(analyzer.readUint16(payload, 1)).toBe(0x1234);
    });

    it('readUint24', () => {
      const payload = new Uint8Array([0x00, 0x12, 0x34, 0x56, 0x00]);
      expect(analyzer.readUint24(payload, 1)).toBe(0x123456);
    });

    it('readUint32', () => {
      const payload = new Uint8Array([0x00, 0x12, 0x34, 0x56, 0x78, 0x00]);
      expect(analyzer.readUint32(payload, 1)).toBe(0x12345678);
    });

    it('readAsciiString', () => {
      // "ABC" with a null terminator padded
      const payload = new Uint8Array([0x00, 65, 66, 67, 0, 0, 0x00]);
      expect(analyzer.readAsciiString(payload, 1, 5)).toBe('ABC');
    });

    it('readBoolean', () => {
      const payload = new Uint8Array([0x00, 0x01, 0x00, 0xFF]);
      expect(analyzer.readBoolean(payload, 1, 'prop')).toBe(true);
      expect(analyzer.readBoolean(payload, 2, 'prop')).toBe(false);
      expect(() => analyzer.readBoolean(payload, 3, 'prop')).toThrow(BoksProtocolError);
    });

    it('readByteArray', () => {
      const payload = new Uint8Array([0x00, 0xAA, 0xBB, 0xCC, 0xDD]);
      const resFixed = analyzer.readByteArray(payload, 1, 2);
      expect(Array.from(resFixed)).toEqual([0xAA, 0xBB]);

      const resVar = analyzer.readByteArray(payload, 2);
      expect(Array.from(resVar)).toEqual([0xBB, 0xCC, 0xDD]);
    });

    it('readMacAddress', () => {
      // Reverse Little Endian logic
      const payload = new Uint8Array([0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66]);
      expect(analyzer.readMacAddress(payload, 1)).toBe('665544332211');
    });

    it('readPinCode', () => {
      const payload = new Uint8Array([0x00, 49, 50, 65, 66, 48, 57]); // "12AB09"
      expect(analyzer.readPinCode(payload, 1, 'prop')).toBe('12AB09');

      const payloadId = new Uint8Array([77, 67, 49, 50, 51, 52]); // "MC1234"
      expect(analyzer.readPinCode(payloadId, 0, 'prop', true)).toBe('MC1234');

      // Invalid
      const payloadInv = new Uint8Array([88, 88, 88, 88, 88, 88]); // "XXXXXX"
      expect(() => analyzer.readPinCode(payloadInv, 0, 'prop')).toThrow(BoksProtocolError);
    });

    it('readConfigKey', () => {
      const payload = new Uint8Array([65, 66, 67, 68, 69, 70, 48, 57]); // "ABCDEF09"
      expect(analyzer.readConfigKey(payload, 0, 'prop')).toBe('ABCDEF09');

      const payloadInv = new Uint8Array([88, 88, 88, 88, 88, 88, 88, 88]); // "XXXXXXXX"
      expect(() => analyzer.readConfigKey(payloadInv, 0, 'prop')).toThrow(BoksProtocolError);
    });

    it('readHexString', () => {
      const payload = new Uint8Array([0x00, 0xAA, 0xBB, 0xCC, 0xDD]);
      expect(analyzer.readHexString(payload, 1, 2)).toBe('AABB');
      expect(analyzer.readHexString(payload, 1)).toBe('AABBCCDD');
    });

    it('readVarLenHex', () => {
      const payload = new Uint8Array([0x00, 0x02, 0xAA, 0xBB, 0x00]);
      expect(analyzer.readVarLenHex(payload, 1, 'prop')).toBe('AABB');

      const payloadInv = new Uint8Array([0x02, 0xAA]); // too short
      expect(() => analyzer.readVarLenHex(payloadInv, 0, 'prop')).toThrow(BoksProtocolError);
    });

    it('readBit', () => {
      const payload = new Uint8Array([0b00000100]); // bit 2 is true
      expect(analyzer.readBit(payload, 0, 2)).toBe(true);
      expect(analyzer.readBit(payload, 0, 1)).toBe(false);
    });
  });

  describe('validate methods', () => {
    it('validatePinCode', () => {
      expect(() => analyzer.validatePinCode('12AB09', 'prop')).not.toThrow();
      expect(() => analyzer.validatePinCode('MC1234', 'prop', true)).not.toThrow();

      expect(() => analyzer.validatePinCode(123456, 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.validatePinCode('12345', 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.validatePinCode('XXXXXX', 'prop')).toThrow(BoksProtocolError);
    });

    it('validateConfigKey', () => {
      expect(() => analyzer.validateConfigKey('ABCDEF09', 'prop')).not.toThrow();

      expect(() => analyzer.validateConfigKey(12345678, 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.validateConfigKey('1234567', 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.validateConfigKey('XXXXXXXX', 'prop')).toThrow(BoksProtocolError);
    });
  });

  describe('write methods', () => {
    it('writeUint8', () => {
      const payload = new Uint8Array(2);
      analyzer.writeUint8(payload, 1, 0x1A);
      expect(payload[1]).toBe(0x1A);
    });

    it('writeUint16', () => {
      const payload = new Uint8Array(3);
      analyzer.writeUint16(payload, 1, 0x1234);
      expect(payload[1]).toBe(0x12);
      expect(payload[2]).toBe(0x34);
    });

    it('writeUint24', () => {
      const payload = new Uint8Array(4);
      analyzer.writeUint24(payload, 1, 0x123456);
      expect(payload[1]).toBe(0x12);
      expect(payload[2]).toBe(0x34);
      expect(payload[3]).toBe(0x56);
    });

    it('writeUint32', () => {
      const payload = new Uint8Array(5);
      analyzer.writeUint32(payload, 1, 0x12345678);
      expect(payload[1]).toBe(0x12);
      expect(payload[2]).toBe(0x34);
      expect(payload[3]).toBe(0x56);
      expect(payload[4]).toBe(0x78);
    });

    it('writeAsciiString', () => {
      const payload = new Uint8Array(4);
      analyzer.writeAsciiString(payload, 1, "AB", 3);
      expect(payload[1]).toBe(65);
      expect(payload[2]).toBe(66);
      expect(payload[3]).toBe(0); // padded
    });

    it('writeBoolean', () => {
      const payload = new Uint8Array(2);
      analyzer.writeBoolean(payload, 0, true);
      analyzer.writeBoolean(payload, 1, false);
      expect(payload[0]).toBe(0x01);
      expect(payload[1]).toBe(0x00);
    });

    it('writeByteArray', () => {
      const payload = new Uint8Array(5);
      const src = new Uint8Array([0xAA, 0xBB, 0xCC]);

      analyzer.writeByteArray(payload, 1, src, 2);
      expect(Array.from(payload)).toEqual([0x00, 0xAA, 0xBB, 0x00, 0x00]);

      const payload2 = new Uint8Array(5);
      analyzer.writeByteArray(payload2, 1, src);
      expect(Array.from(payload2)).toEqual([0x00, 0xAA, 0xBB, 0xCC, 0x00]);

      // should ignore non-Uint8Array gracefully
      analyzer.writeByteArray(payload2, 0, "not an array");
    });

    it('writeMacAddress', () => {
      const payload = new Uint8Array(7);
      analyzer.writeMacAddress(payload, 1, "665544332211");
      expect(Array.from(payload)).toEqual([0, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66]);

      // ignore invalid
      analyzer.writeMacAddress(payload, 0, 123);
    });

    it('writePinCode', () => {
      const payload = new Uint8Array(6);
      analyzer.writePinCode(payload, 0, "12AB09");
      expect(Array.from(payload)).toEqual([49, 50, 65, 66, 48, 57]);
    });

    it('writeConfigKey', () => {
      const payload = new Uint8Array(8);
      analyzer.writeConfigKey(payload, 0, "ABCDEF09");
      expect(Array.from(payload)).toEqual([65, 66, 67, 68, 69, 70, 48, 57]);
    });

    it('writeHexString', () => {
      const payload = new Uint8Array(4);
      analyzer.writeHexString(payload, 1, "AABBCC", 2);
      expect(Array.from(payload)).toEqual([0, 0xAA, 0xBB, 0]);

      const payload2 = new Uint8Array(4);
      analyzer.writeHexString(payload2, 1, new Uint8Array([0x11, 0x22, 0x33]), 2);
      expect(Array.from(payload2)).toEqual([0, 0x11, 0x22, 0]);

      const payload3 = new Uint8Array(4);
      analyzer.writeHexString(payload3, 1, "AABB");
      expect(Array.from(payload3)).toEqual([0, 0xAA, 0xBB, 0]);

      const payload4 = new Uint8Array(4);
      analyzer.writeHexString(payload4, 1, new Uint8Array([0x11, 0x22]));
      expect(Array.from(payload4)).toEqual([0, 0x11, 0x22, 0]);
    });

    it('writeVarLenHex', () => {
      const payload = new Uint8Array(5);
      analyzer.writeVarLenHex(payload, 1, "AABB");
      expect(Array.from(payload)).toEqual([0, 2, 0xAA, 0xBB, 0]);

      analyzer.writeVarLenHex(payload, 0, 123); // invalid
      expect(payload[0]).toBe(0);
    });

    it('writeBit', () => {
      const payload = new Uint8Array(1);
      analyzer.writeBit(payload, 0, 2, true);
      expect(payload[0]).toBe(0b00000100);
      analyzer.writeBit(payload, 0, 2, false);
      expect(payload[0]).toBe(0);
    });
  });
});

  describe('Detailed validation branches (for 100% branch coverage)', () => {
    it('readPinCode - should throw on specific indices', () => {
      const analyzer = new PayloadAnalyzer();
      // Test invalid char at each index
      const p0 = new Uint8Array([0x00, 88, 49, 49, 49, 49, 49]); // X11111
      const p1 = new Uint8Array([0x00, 49, 88, 49, 49, 49, 49]); // 1X1111
      const p2 = new Uint8Array([0x00, 49, 49, 88, 49, 49, 49]); // 11X111
      const p3 = new Uint8Array([0x00, 49, 49, 49, 88, 49, 49]); // 111X11
      const p4 = new Uint8Array([0x00, 49, 49, 49, 49, 88, 49]); // 1111X1
      const p5 = new Uint8Array([0x00, 49, 49, 49, 49, 49, 88]); // 11111X

      expect(() => analyzer.readPinCode(p0, 1, 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.readPinCode(p1, 1, 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.readPinCode(p2, 1, 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.readPinCode(p3, 1, 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.readPinCode(p4, 1, 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.readPinCode(p5, 1, 'prop')).toThrow(BoksProtocolError);

      // Test allowIds branches
      const pid0 = new Uint8Array([0x00, 77, 88, 49, 49, 49, 49]); // MX1111 (M but no C)
      expect(() => analyzer.readPinCode(pid0, 1, 'prop', true)).toThrow(BoksProtocolError);

      const pid1 = new Uint8Array([0x00, 88, 67, 49, 49, 49, 49]); // XC1111 (C but no M/U)
      expect(() => analyzer.readPinCode(pid1, 1, 'prop', true)).toThrow(BoksProtocolError);
    });

    it('readConfigKey - should throw on specific indices', () => {
      const analyzer = new PayloadAnalyzer();
      const p0 = new Uint8Array([0x00, 88, 65, 65, 65, 65, 65, 65, 65]);
      const p1 = new Uint8Array([0x00, 65, 88, 65, 65, 65, 65, 65, 65]);
      const p2 = new Uint8Array([0x00, 65, 65, 88, 65, 65, 65, 65, 65]);
      const p3 = new Uint8Array([0x00, 65, 65, 65, 88, 65, 65, 65, 65]);
      const p4 = new Uint8Array([0x00, 65, 65, 65, 65, 88, 65, 65, 65]);
      const p5 = new Uint8Array([0x00, 65, 65, 65, 65, 65, 88, 65, 65]);
      const p6 = new Uint8Array([0x00, 65, 65, 65, 65, 65, 65, 88, 65]);
      const p7 = new Uint8Array([0x00, 65, 65, 65, 65, 65, 65, 65, 88]);

      expect(() => analyzer.readConfigKey(p0, 1, 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.readConfigKey(p1, 1, 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.readConfigKey(p2, 1, 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.readConfigKey(p3, 1, 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.readConfigKey(p4, 1, 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.readConfigKey(p5, 1, 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.readConfigKey(p6, 1, 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.readConfigKey(p7, 1, 'prop')).toThrow(BoksProtocolError);
    });

    it('validatePinCode - should throw on specific indices', () => {
      const analyzer = new PayloadAnalyzer();
      expect(() => analyzer.validatePinCode('X11111', 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.validatePinCode('1X1111', 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.validatePinCode('11X111', 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.validatePinCode('111X11', 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.validatePinCode('1111X1', 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.validatePinCode('11111X', 'prop')).toThrow(BoksProtocolError);

      expect(() => analyzer.validatePinCode('MX1111', 'prop', true)).toThrow(BoksProtocolError);
      expect(() => analyzer.validatePinCode('XC1111', 'prop', true)).toThrow(BoksProtocolError);
    });

    it('validateConfigKey - should throw on specific indices', () => {
      const analyzer = new PayloadAnalyzer();
      expect(() => analyzer.validateConfigKey('XAAAAAAA', 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.validateConfigKey('AXAAAAAA', 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.validateConfigKey('AAXAAAAA', 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.validateConfigKey('AAAXAAAA', 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.validateConfigKey('AAAAXAAA', 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.validateConfigKey('AAAAAXAA', 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.validateConfigKey('AAAAAAXA', 'prop')).toThrow(BoksProtocolError);
      expect(() => analyzer.validateConfigKey('AAAAAAAX', 'prop')).toThrow(BoksProtocolError);
    });
  });
