import { describe, it, expect } from 'vitest';
import { NotifyCodesCountPacket } from '@/protocol/uplink/NotifyCodesCountPacket';
import { hexToBytes } from '@/utils/converters';

describe('NotifyCodesCountPacket', () => {
  it('should parse master and other counts (Big Endian)', () => {
    const packet = NotifyCodesCountPacket.fromPayload(hexToBytes('00020CFD'));
    expect(packet.masterCount).toBe(2);
    expect(packet.otherCount).toBe(3325);
  });
});
