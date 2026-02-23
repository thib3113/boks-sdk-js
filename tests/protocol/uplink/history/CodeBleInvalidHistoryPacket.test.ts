import { describe, it, expect } from 'vitest';
import { CodeBleInvalidHistoryPacket } from '@/protocol/uplink/history/CodeBleInvalidHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes } from '@/utils/converters';

describe('CodeBleInvalidHistoryPacket', () => {
  it('should parse correctly with age and code', () => {
    const payload = new Uint8Array(3 + 6);
    payload[0] = 0; payload[1] = 0; payload[2] = 10;
    payload.set(stringToBytes('123456'), 3);

    const packet = CodeBleInvalidHistoryPacket.fromPayload(payload);
    
    expect(packet.opcode).toBe(BoksOpcode.LOG_CODE_BLE_INVALID);
    expect(packet.age).toBe(10);
    expect(packet.code).toBe('123456');
  });

  it('should handle short payload (no code)', () => {
    const payload = new Uint8Array(3);
    const packet = CodeBleInvalidHistoryPacket.fromPayload(payload);
    expect(packet.code).toBe('');
  });
});
