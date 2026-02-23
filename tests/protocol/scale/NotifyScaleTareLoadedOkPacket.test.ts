import { describe, it, expect } from 'vitest';
import { NotifyScaleTareLoadedOkPacket } from '@/protocol/scale/NotifyScaleTareLoadedOkPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyScaleTareLoadedOkPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = NotifyScaleTareLoadedOkPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_TARE_LOADED_OK);
  });
});
