import { describe, it, expect } from 'vitest';
import { CodeKeyInvalidHistoryPacket } from '@/protocol/uplink/history/CodeKeyInvalidHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes } from '@/utils/converters';

describe('CodeKeyInvalidHistoryPacket', () => {
  it('should parse correctly with age and code', () => {
    const payload = new Uint8Array(3 + 6);
    payload[0] = 0; payload[1] = 0; payload[2] = 10;
    payload.set(stringToBytes('123456'), 3);

    const packet = CodeKeyInvalidHistoryPacket.fromPayload(payload);
    
    expect(packet.opcode).toBe(BoksOpcode.LOG_CODE_KEY_INVALID);
    expect(packet.age).toBe(10);
    expect(packet.code).toBe('123456');
  });

  it('should handle short payload (no code)', () => {
    const payload = new Uint8Array(3);
    const packet = CodeKeyInvalidHistoryPacket.fromPayload(payload);
    expect(packet.code).toBe('');
  });


  describe('CodeKeyInvalidHistoryPacket short payload age code block', () => {
    it('should extract age 0 if payload is shorter than 3', () => {
      const payload = new Uint8Array([0, 0]); // Length 2
      const packet = CodeKeyInvalidHistoryPacket.fromPayload(payload);
      expect(packet.age).toBe(0);
    });
  });

  describe('CodeKeyInvalidHistoryPacket short payload code block', () => {
    it('should extract undefined code if payload is shorter than expected', () => {
      const payload = new Uint8Array([0, 0, 3, 49, 50, 51, 52, 53]); // Length 8
      const packet = CodeKeyInvalidHistoryPacket.fromPayload(payload);
      expect(packet.code).toBe('');
    });
  });


  describe('CodeKeyInvalidHistoryPacket default construction', () => {
    it('should handle constructor with default parameters', () => {
      const packet = new CodeKeyInvalidHistoryPacket();
      expect(packet.age).toBe(0);
      expect(packet.code).toBe('');
    });
  });
});
