import { describe, it, expect } from 'vitest';
import { OperationSuccessPacket } from '@/protocol/uplink/OperationSuccessPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('OperationSuccessPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = OperationSuccessPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.CODE_OPERATION_SUCCESS);
  });
});
