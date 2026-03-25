import { describe, it, expect } from 'vitest';
import { NotifyScaleTareEmptyOkPacket } from '@/protocol/scale/NotifyScaleTareEmptyOkPacket';
import { BoksOpcode } from '@/protocol/constants';
import { buildMockRawPacket } from '../../../utils/packet-builder';

describe('NotifyScaleTareEmptyOkPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = NotifyScaleTareEmptyOkPacket.fromRaw(buildMockRawPacket(NotifyScaleTareEmptyOkPacket.opcode, payload));
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_TARE_EMPTY_OK);
  });
});
