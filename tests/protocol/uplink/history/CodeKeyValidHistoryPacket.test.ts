import { describe, expect, it } from 'vitest';
import { CodeKeyValidHistoryPacket } from '@/protocol/uplink/history/CodeKeyValidHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('CodeKeyValidHistoryPacket', () => {
  it('should parse correctly with age and code', () => {
    const payload = new Uint8Array([0, 0, 10, 49, 50, 51, 52, 53, 54]);
    const packet = CodeKeyValidHistoryPacket.fromPayload(payload);
    
    expect(packet.opcode).toBe(BoksOpcode.LOG_CODE_KEY_VALID);
    expect(packet.age).toBe(10);
    expect(packet.code).toBe('123456');

  });



  it('should handle constructor with default parameters', () => {
    const packet = new CodeKeyValidHistoryPacket(0, '000000');
    expect(packet.age).toBe(0);
    expect(packet.code).toBe('000000');

  });
});
