import { BoksPacketFactory } from '@/protocol/BoksPacketFactory';
import { describe, it, expect } from 'vitest';
import { NotifyScaleTareEmptyOkPacket } from '@/protocol/scale/NotifyScaleTareEmptyOkPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyScaleTareEmptyOkPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = NotifyScaleTareEmptyOkPacket.fromRaw(payload);
    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_SCALE_TARE_EMPTY_OK);
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([NotifyScaleTareEmptyOkPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    const hex = bytesToHex(dummyPayload);
    const packet = BoksPacketFactory.fromHex(hex, { strict: false });
    expect(bytesToHex(packet.raw).toUpperCase()).toBe(hex.toUpperCase());
  });
});
