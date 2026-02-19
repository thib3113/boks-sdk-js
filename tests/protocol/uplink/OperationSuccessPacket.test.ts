import { describe, it, expect } from 'vitest';
import { OperationSuccessPacket } from '@/protocol/uplink/OperationSuccessPacket';

describe('OperationSuccessPacket', () => {
  it('should parse correctly', () => {
    const packet = OperationSuccessPacket.fromPayload(new Uint8Array(0));
    expect(packet.opcode).toBe(0x77);
  });
});
