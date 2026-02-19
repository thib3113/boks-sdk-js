import { describe, it, expect } from 'vitest';
import { BleRebootHistoryPacket } from '@/protocol/uplink/history/BleRebootHistoryPacket';
import { hexToBytes } from '@/utils/converters';

describe('BleRebootHistoryPacket', () => {
  it('should parse age correctly', () => {
    const packet = BleRebootHistoryPacket.fromPayload(hexToBytes('00003C'));
    expect(packet.age).toBe(60);
  });
});
