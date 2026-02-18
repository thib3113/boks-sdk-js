import { describe, it, expect } from 'vitest';
import { NotifyLogsCountPacket } from '@/protocol/uplink/NotifyLogsCountPacket';
import { hexToBytes } from '@/utils/converters';

describe('NotifyLogsCountPacket', () => {
  it('should parse log count (Big Endian)', () => {
    const packet = new NotifyLogsCountPacket();
    packet.parse(hexToBytes('0017'));
    expect(packet.count).toBe(23);
  });
});



