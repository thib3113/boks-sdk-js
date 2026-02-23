import { describe, it, expect } from 'vitest';
import { OperationErrorPacket } from '@/protocol/uplink/OperationErrorPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('OperationErrorPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array([0x55]);
    const packet = OperationErrorPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.CODE_OPERATION_ERROR);
    expect(packet.errorCode).toBe(0x55);
  });

  it('should default to error code 0 if payload is empty', () => {
    const packet = OperationErrorPacket.fromPayload(new Uint8Array(0));
    expect(packet.errorCode).toBe(0);
  });
});
