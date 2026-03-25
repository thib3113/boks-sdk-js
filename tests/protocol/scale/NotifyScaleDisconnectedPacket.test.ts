import { describe, it, expect } from 'vitest';
import { NotifyScaleDisconnectedPacket } from '@/protocol/scale/NotifyScaleDisconnectedPacket';
import { BoksOpcode } from '@/protocol/constants';
import { buildMockRawPacket } from '../../../utils/packet-builder';

describe('NotifyScaleDisconnectedPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = NotifyScaleDisconnectedPacket.fromRaw(buildMockRawPacket(NotifyScaleDisconnectedPacket.opcode, payload));
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_DISCONNECTED);
  });
});
