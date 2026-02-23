import { describe, it, expect } from 'vitest';
import { CountCodesPacket } from '@/protocol/downlink/CountCodesPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('CountCodesPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new CountCodesPacket();
    expect(packet.opcode).toBe(BoksOpcode.COUNT_CODES);
    expect(bytesToHex(packet.encode())).toBe('140014');
  });

  it('should parse from payload correctly', () => {
    const packet = CountCodesPacket.fromPayload(new Uint8Array(0));
    expect(packet).toBeInstanceOf(CountCodesPacket);
    expect(packet.opcode).toBe(BoksOpcode.COUNT_CODES);
  });

  it('should handle extra payload bytes gracefully (ignore them)', () => {
      const packet = CountCodesPacket.fromPayload(new Uint8Array([0xFF]));
      expect(packet).toBeInstanceOf(CountCodesPacket);
  });
});
