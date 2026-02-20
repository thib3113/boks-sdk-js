import { describe, it, expect } from 'vitest';
import { CodeBleValidHistoryPacket } from '@/protocol/uplink/history/CodeBleValidHistoryPacket';
import { hexToBytes } from '@/utils/converters';
import { BoksOpcode } from '@/protocol/constants';

describe('CodeBleValidHistoryPacket', () => {
  it('should parse age, code, connected MAC and date correctly', () => {
    const age = 10;
    const now = Date.now();
    // 0-2: Age (10), 3-8: Code ("1234AB"), 9-10: Padding, 11-16: MAC reversed
    const payload = hexToBytes('00000A3132333441420000FFEEDDCCBBAA');
    const packet = CodeBleValidHistoryPacket.fromPayload(payload);
    
    expect(packet.age).toBe(age);
    expect(packet.code).toBe('1234AB');
    expect(packet.connectedMac).toBe('AA:BB:CC:DD:EE:FF');
    expect(packet.opcode).toBe(BoksOpcode.LOG_CODE_BLE_VALID);

    // Date calculation verification (within 1000ms)
    const expectedTime = now - age * 1000;
    expect(Math.abs(packet.date.getTime() - expectedTime)).toBeLessThan(1000);
  });
});
