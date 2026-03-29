import { describe, it, expect } from 'vitest';
import { PayloadMapper, getOrCreateMetadata } from '../../src/protocol/decorators/PayloadMapper';
import { BoksProtocolError } from '../../src/errors/BoksProtocolError';

describe('PayloadMapper JIT Coverage Extras', () => {
  describe('getOrCreateMetadata (no metadata property)', () => {
    it('returns empty array when context.metadata is undefined', () => {
      const mockContext: any = {};
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

describe('PayloadMapper JIT Coverage Extras', () => {
  describe('getOrCreateMetadata (no metadata property)', () => {
    it('returns empty array when context.metadata is undefined', async () => {
      const mockContext: any = {};
      const { getOrCreateMetadata } = await import('../../src/protocol/decorators/PayloadMapper');
      const result = getOrCreateMetadata(mockContext);
      expect(result).toEqual([]);
    });
  });
});
