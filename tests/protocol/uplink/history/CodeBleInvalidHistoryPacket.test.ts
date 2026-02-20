import { describe, it, expect } from 'vitest';
import { CodeBleInvalidHistoryPacket } from '@/protocol/uplink/history/CodeBleInvalidHistoryPacket';
import { hexToBytes } from '@/utils/converters';
import { BoksOpcode } from '@/protocol/constants';

describe('CodeBleInvalidHistoryPacket', () => {
  it('should parse age, code, connected MAC and date correctly', () => {
    const age = 42;
    const now = Date.now();
    // 0-2: Age (42), 3-8: Code ("123456"), 9-10: Padding, 11-16: MAC reversed
    const payload = hexToBytes('00002A3132333435360000FFEEDDCCBBAA');
    const packet = CodeBleInvalidHistoryPacket.fromPayload(payload);
    
    expect(packet.age).toBe(age);
    expect(packet.code).toBe('123456');
    expect(packet.connectedMac).toBe('AA:BB:CC:DD:EE:FF');
    expect(packet.opcode).toBe(BoksOpcode.LOG_CODE_BLE_INVALID);

    // Date calculation verification (within 1000ms)
    const expectedTime = now - age * 1000;
    expect(Math.abs(packet.date.getTime() - expectedTime)).toBeLessThan(1000);
  });
});
