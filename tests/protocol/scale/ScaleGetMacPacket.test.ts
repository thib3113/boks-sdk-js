import { describe, it, expect } from 'vitest';
import { ScaleGetMacPacket } from '@/protocol/scale/ScaleGetMacPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('ScaleGetMacPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new ScaleGetMacPacket();
    expect(packet.opcode).toBe(BoksOpcode.SCALE_GET_MAC_ADDRESS_BOKS);
    expect(bytesToHex(packet.encode())).toBe('520052');
  });

  it('should parse from payload correctly', () => {
    const packet = ScaleGetMacPacket.fromPayload(new Uint8Array(0));
    expect(packet.opcode).toBe(BoksOpcode.SCALE_GET_MAC_ADDRESS_BOKS);
  });
});
