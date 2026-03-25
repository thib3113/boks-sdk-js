import { describe, it, expect } from 'vitest';
import { OperationSuccessPacket } from '@/protocol/uplink/OperationSuccessPacket';
import { BoksOpcode } from '@/protocol/constants';
import { buildMockRawPacket } from '../../../utils/packet-builder';

describe('OperationSuccessPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = OperationSuccessPacket.fromRaw(buildMockRawPacket(OperationSuccessPacket.opcode, payload));
    expect(packet.opcode).toBe(BoksOpcode.CODE_OPERATION_SUCCESS);
  });
});
