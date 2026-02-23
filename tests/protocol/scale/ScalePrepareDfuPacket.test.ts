import { describe, it, expect } from 'vitest';
import { ScalePrepareDfuPacket } from '@/protocol/scale/ScalePrepareDfuPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';

describe('ScalePrepareDfuPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new ScalePrepareDfuPacket();
    expect(packet.opcode).toBe(BoksOpcode.SCALE_PREPARE_DFU);
    expect(bytesToHex(packet.encode())).toBe('600060');
  });

  it('should parse from payload correctly', () => {
    const packet = ScalePrepareDfuPacket.fromPayload(new Uint8Array(0));
    expect(packet.opcode).toBe(BoksOpcode.SCALE_PREPARE_DFU);
  });
});
