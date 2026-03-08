import { describe, it, expect } from 'vitest';
import { CodeKeyValidHistoryPacket } from '@/protocol/uplink/history/CodeKeyValidHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes } from '@/utils/converters';

describe('CodeKeyValidHistoryPacket', () => {
  it('should parse correctly with age and code', () => {
    const payload = new Uint8Array(3 + 6);
    payload[0] = 0; payload[1] = 0; payload[2] = 10;
    payload.set(stringToBytes('123456'), 3);

    const packet = CodeKeyValidHistoryPacket.fromPayload(payload);
    
    expect(packet.opcode).toBe(BoksOpcode.LOG_CODE_KEY_VALID);
    expect(packet.age).toBe(10);
    expect(packet.code).toBe('123456');
  });

  it('should handle short payload (no code)', () => {
    const payload = new Uint8Array(3);
    const packet = CodeKeyValidHistoryPacket.fromPayload(payload);
    expect(packet.code).toBe('');
  });


  describe('CodeKeyValidHistoryPacket default construction', () => {
    it('should handle constructor with default params', () => {
      const packet = new CodeKeyValidHistoryPacket();
      expect(packet.age).toBe(0);
      expect(packet.code).toBe('');
    });
  });


  describe('CodeKeyValidHistoryPacket short payload age code block', () => {
    it('should extract age 0 if payload is shorter than 3', () => {
      const payload = new Uint8Array([0, 0]); // Length 2
      const packet = CodeKeyValidHistoryPacket.fromPayload(payload);
      expect(packet.age).toBe(0);
    });
  });

  describe('CodeKeyValidHistoryPacket short payload code block', () => {
    it('should extract undefined code if payload is shorter than expected', () => {
      const payload = new Uint8Array([0, 0, 3, 49, 50, 51, 52, 53]); // Length 8
      const packet = CodeKeyValidHistoryPacket.fromPayload(payload);
      expect(packet.code).toBe('');
    });
  });
});
