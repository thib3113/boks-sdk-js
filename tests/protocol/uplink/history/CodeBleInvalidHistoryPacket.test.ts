import { describe, it, expect } from 'vitest';
import { CodeBleInvalidHistoryPacket } from '@/protocol/uplink/history/CodeBleInvalidHistoryPacket';
import { hexToBytes } from '@/utils/converters';

describe('CodeBleInvalidHistoryPacket', () => {
  it('should parse age, code and connected MAC correctly', () => {
    const payload = hexToBytes('00002A3132333435360000FFEEDDCCBBAA');
    const packet = CodeBleInvalidHistoryPacket.fromPayload(payload);
    
    expect(packet.age).toBe(42);
    expect(packet.code).toBe('123456');
    expect(packet.connectedMac).toBe('AA:BB:CC:DD:EE:FF');
  });
});
