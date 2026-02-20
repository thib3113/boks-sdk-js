import { describe, it, expect } from 'vitest';
import { BleRebootHistoryPacket } from '@/protocol/uplink/history/BleRebootHistoryPacket';
import { hexToBytes } from '@/utils/converters';
import { BoksOpcode } from '@/protocol/constants';

describe('BleRebootHistoryPacket', () => {
  it('should parse age and date correctly', () => {
    const age = 60;
    const now = Date.now();
    const packet = BleRebootHistoryPacket.fromPayload(hexToBytes('00003C'));

    expect(packet.age).toBe(age);
    expect(packet.opcode).toBe(BoksOpcode.BLE_REBOOT);

    // Date calculation verification (within 1000ms)
    const expectedTime = now - age * 1000;
    expect(Math.abs(packet.date.getTime() - expectedTime)).toBeLessThan(1000);
  });
});
