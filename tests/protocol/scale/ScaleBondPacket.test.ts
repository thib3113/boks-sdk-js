import { describe, it, expect } from 'vitest';
import { ScaleBondPacket } from '@/protocol/scale/ScaleBondPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('ScaleBondPacket', () => {
  it('should construct and encode correctly', () => {
    // 0x01, 0x02, 0x03
    const data = new Uint8Array([0x01, 0x02, 0x03]);
    const packet = new ScaleBondPacket(data);
    expect(packet.opcode).toBe(BoksOpcode.SCALE_BOND);

    // Opcode 50. Len 3. Payload 010203.
    const encoded = packet.encode();
    expect(encoded[0]).toBe(0x50);
    expect(encoded[1]).toBe(3);
    expect(bytesToHex(encoded.subarray(2, 5))).toBe('010203');
  });

  it('should parse from payload correctly', () => {
    const data = new Uint8Array([0x01, 0x02, 0x03]);
    const packet = ScaleBondPacket.fromPayload(data);
    expect(packet.data).toEqual(data);
  });
});
