import { describe, expect, it } from 'vitest';
import { CodeBleValidHistoryPacket } from '@/protocol/uplink/history/CodeBleValidHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('CodeBleValidHistoryPacket', () => {
  it('should parse correctly with age and code', () => {
    const payload = new Uint8Array([0, 0, 10, 49, 50, 51, 52, 53, 54, 0, 0, 0, 0, 0, 0, 0, 0]);
    const packet = CodeBleValidHistoryPacket.fromPayload(payload);
    
    expect(packet.opcode).toBe(BoksOpcode.LOG_CODE_BLE_VALID);
    expect(packet.age).toBe(10);
    expect(packet.code).toBe('123456');
    expect(packet.connectedMac).toBe('00:00:00:00:00:00');
  });

  it('should cover the code branch where length is strictly 17', () => {
    const payload = new Uint8Array([0, 0, 3, 49, 50, 51, 52, 53, 54, 53, 54, 55, 56, 57, 48, 0, 0]);
    const packet = CodeBleValidHistoryPacket.fromPayload(payload);
    expect(packet.connectedMac).toBe('00:00:30:39:38:37');
  });

  it('should handle constructor with default parameters', () => {
    const packet = new CodeBleValidHistoryPacket(0, '000000', '00:00:00:00:00:00');
    expect(packet.age).toBe(0);
    expect(packet.code).toBe('000000');
    expect(packet.connectedMac).toBe('00:00:00:00:00:00');
  });
});
