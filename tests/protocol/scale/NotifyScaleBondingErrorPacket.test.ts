import { describe, it, expect } from 'vitest';
import { NotifyScaleBondingErrorPacket } from '@/protocol/scale/NotifyScaleBondingErrorPacket';
import { hexToBytes } from '@/utils/converters';

describe('NotifyScaleBondingErrorPacket', () => {
  it('should parse error code correctly', () => {
    const packet = NotifyScaleBondingErrorPacket.fromPayload(hexToBytes('05'));
    expect(packet.errorCode).toBe(5);
  });
});
