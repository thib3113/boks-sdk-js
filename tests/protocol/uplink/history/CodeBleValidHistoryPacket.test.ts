import { describe, it, expect } from 'vitest';
import { CodeBleValidHistoryPacket } from '@/protocol/uplink/history/CodeBleValidHistoryPacket';
import { hexToBytes } from '@/utils/converters';

describe('CodeBleValidHistoryPacket', () => {
  it('should parse age, code and connected MAC correctly', () => {
    const payload = hexToBytes('00000A3132333441420000FFEEDDCCBBAA');
    const packet = CodeBleValidHistoryPacket.fromPayload(payload);
    
    expect(packet.age).toBe(10);
    expect(packet.code).toBe('1234AB');
    expect(packet.connectedMac).toBe('AA:BB:CC:DD:EE:FF');
  });
});
