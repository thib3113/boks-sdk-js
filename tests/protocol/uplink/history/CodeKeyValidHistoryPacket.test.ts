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
});
