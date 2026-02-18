import { describe, it, expect } from 'vitest';
import { NotifyScaleBondingErrorPacket } from '@/protocol/scale/NotifyScaleBondingErrorPacket';
import { hexToBytes } from '@/utils/converters';

describe('NotifyScaleBondingErrorPacket', () => {
  it('should parse error code correctly', () => {
    const packet = new NotifyScaleBondingErrorPacket();
    packet.parse(hexToBytes('05'));
    expect(packet.errorCode).toBe(5);
  });
});



