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


  describe('CodeBleInvalidHistoryPacket short payload age code block', () => {
    it('should extract age 0 if payload is shorter than 3', () => {
      const payload = new Uint8Array([0, 0]); // Length 2
      const packet = CodeBleInvalidHistoryPacket.fromPayload(payload);
      expect(packet.age).toBe(0);
    });
  });


  describe('CodeBleInvalidHistoryPacket branch coverage short code', () => {
    it('should extract undefined code if payload is shorter than expected', () => {
      const payload = new Uint8Array([0, 0, 3, 49, 50, 51, 52, 53]); // Length 8
      const packet = CodeBleInvalidHistoryPacket.fromPayload(payload);
      expect(packet.code).toBe('');
    });
  });

  describe('CodeBleInvalidHistoryPacket short payload connectedMac branch exact length', () => {
    it('should cover the code branch where length is strictly 17', () => {
      const payload = new Uint8Array([0, 0, 3, 49, 50, 51, 52, 53, 54, 0, 0, 1, 2, 3, 4, 5, 6]); // Length 17
      const packet = CodeBleInvalidHistoryPacket.fromPayload(payload);
      expect(packet.connectedMac).toBe('06:05:04:03:02:01');
    });
  });

  describe('CodeBleInvalidHistoryPacket short payload connectedMac block', () => {
    it('should extract empty mac if payload length is shorter than expected', () => {
      const payload = new Uint8Array([0, 0, 3, 49, 50, 51, 52, 53, 54, 0, 0, 1, 2, 3, 4]); // Length 15
      const packet = CodeBleInvalidHistoryPacket.fromPayload(payload);
      expect(packet.connectedMac).toBe('');
    });
  });


  describe('CodeBleInvalidHistoryPacket default construction', () => {
    it('should handle constructor with default parameters', () => {
      const packet = new CodeBleInvalidHistoryPacket();
      expect(packet.age).toBe(0);
      expect(packet.code).toBe('');
      expect(packet.connectedMac).toBe('');
    });
  });
});
