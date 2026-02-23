import { describe, it, expect } from 'vitest';
import { BleRebootHistoryPacket } from '@/protocol/uplink/history/BleRebootHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('BleRebootHistoryPacket', () => {
  it('should parse correctly with age', () => {
    // Age = 0x010203 = 66051 seconds
    const payload = new Uint8Array([0x01, 0x02, 0x03]);
    const packet = BleRebootHistoryPacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.BLE_REBOOT);
    expect(packet.age).toBe(0x010203);
  });

  it('should handle short payload (age 0)', () => {
    const payload = new Uint8Array(2);
    const packet = BleRebootHistoryPacket.fromPayload(payload);
    expect(packet.age).toBe(0);
  });
});
