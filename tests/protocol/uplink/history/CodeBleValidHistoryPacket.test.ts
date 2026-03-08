import { describe, it, expect } from 'vitest';
import { CodeBleValidHistoryPacket } from '@/protocol/uplink/history/CodeBleValidHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { stringToBytes } from '@/utils/converters';

describe('CodeBleValidHistoryPacket', () => {
  it('should parse correctly with age and code', () => {
    const payload = new Uint8Array(3 + 6);
    payload[0] = 0; payload[1] = 0; payload[2] = 10;
    payload.set(stringToBytes('123456'), 3);

    const packet = CodeBleValidHistoryPacket.fromPayload(payload);
    
    expect(packet.opcode).toBe(BoksOpcode.LOG_CODE_BLE_VALID);
    expect(packet.age).toBe(10);
    expect(packet.code).toBe('123456');
  });

  it('should handle short payload (no code)', () => {
    const payload = new Uint8Array(3);
    const packet = CodeBleValidHistoryPacket.fromPayload(payload);
    expect(packet.code).toBe('');
  });


  describe('CodeBleValidHistoryPacket short payload connectedMac branch exact length', () => {
    it('should cover the code branch where length is strictly 17', () => {
      const payload = new Uint8Array([0, 0, 3, 49, 50, 51, 52, 53, 54, 0, 0, 1, 2, 3, 4, 5, 6]); // Length 17
      const packet = CodeBleValidHistoryPacket.fromPayload(payload);
      expect(packet.connectedMac).toBe('06:05:04:03:02:01');
    });
  });

  describe('CodeBleValidHistoryPacket branch coverage short code', () => {
    it('should extract undefined code if payload is shorter than expected', () => {
      const payload = new Uint8Array([0, 0, 3, 49, 50, 51, 52, 53]); // Length 8
      const packet = CodeBleValidHistoryPacket.fromPayload(payload);
      expect(packet.code).toBe('');
    });
  });

  describe('CodeBleValidHistoryPacket short payload connectedMac block', () => {
    it('should extract empty mac if payload length is shorter than expected', () => {
      const payload = new Uint8Array([0, 0, 3, 49, 50, 51, 52, 53, 54, 0, 0, 1, 2, 3, 4]); // Length 15
      const packet = CodeBleValidHistoryPacket.fromPayload(payload);
      expect(packet.connectedMac).toBe('');
    });
  });


  describe('CodeBleValidHistoryPacket short payload age code block', () => {
    it('should extract age 0 if payload is shorter than 3', () => {
      const payload = new Uint8Array([0, 0]); // Length 2
      const packet = CodeBleValidHistoryPacket.fromPayload(payload);
      expect(packet.age).toBe(0);
    });
  });


  describe('CodeBleValidHistoryPacket default construction default params', () => {
    it('should handle constructor with default age', () => {
      const packet = new CodeBleValidHistoryPacket();
      expect(packet.age).toBe(0);
      expect(packet.code).toBe('');
      expect(packet.connectedMac).toBe('');
    });
  });
});
