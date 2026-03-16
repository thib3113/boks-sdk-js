import { describe, it, expect } from 'vitest';
import { ErrorHistoryPacket } from '@/protocol/uplink/history/ErrorHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('ErrorHistoryPacket', () => {
  it('should parse correctly with age and error code', () => {
    const payload = new Uint8Array([0x00, 0x00, 0x0A, 0xFF]);
    const packet = ErrorHistoryPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.LOG_EVENT_ERROR);
    expect(packet.age).toBe(10);
    expect(packet.errorCode).toBe(0xFF);
  });
});
