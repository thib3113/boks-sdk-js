import { describe, it, expect } from 'vitest';
import { NotifyLogsCountPacket } from '@/protocol/uplink/NotifyLogsCountPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyLogsCountPacket', () => {
  it('should parse correctly', () => {
    // 0x0100 -> 256
    const payload = new Uint8Array([0x01, 0x00]);
    const packet = NotifyLogsCountPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_LOGS_COUNT);
    expect(packet.count).toBe(256);
  });

  it('should throw error on short payload', () => {
    const payload = new Uint8Array(1);
    expect(() => NotifyLogsCountPacket.fromPayload(payload)).toThrowError();
  });
});
