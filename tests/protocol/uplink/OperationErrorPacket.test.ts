import { describe, it, expect } from 'vitest';
import { OperationErrorPacket } from '@/protocol/uplink/OperationErrorPacket';

describe('OperationErrorPacket', () => {
  it('should parse error code correctly', () => {
    const packet = new OperationErrorPacket();
    packet.parse(new Uint8Array([0x01]));
    expect(packet.errorCode).toBe(0x01);
  });
});



