import { describe, it, expect } from 'vitest';
import { ScaleReconnectPacket } from '@/protocol/scale/ScaleReconnectPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('ScaleReconnectPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new ScaleReconnectPacket();
    expect(packet.opcode).toBe(BoksOpcode.SCALE_RECONNECT);
    expect(bytesToHex(packet.encode())).toBe('620062');
  });

  it('should parse from payload correctly', () => {
    const packet = ScaleReconnectPacket.fromPayload(new Uint8Array(0));
    expect(packet.opcode).toBe(BoksOpcode.SCALE_RECONNECT);
  });
});
