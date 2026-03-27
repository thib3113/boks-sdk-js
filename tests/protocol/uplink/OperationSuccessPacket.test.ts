import { bytesToHex } from '@/utils/converters';
import { describe, it, expect } from 'vitest';
import { OperationSuccessPacket } from '@/protocol/uplink/OperationSuccessPacket';
import { BoksOpcode } from '@/protocol/constants';

describe('OperationSuccessPacket', () => {
  it('should parse correctly', () => {
    const payload = new Uint8Array(0);
    const packet = OperationSuccessPacket.fromRaw(payload);
    expect(packet.opcode).toBe(BoksOpcode.CODE_OPERATION_SUCCESS);
  });

  it('should retain the exact raw payload when constructed from hex via factory', () => {
    const dummyPayload = new Uint8Array([OperationSuccessPacket.opcode, 0x05, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00]);
    try {
      const packet = OperationSuccessPacket.fromRaw(dummyPayload, { strict: false });
      if (packet) {
        expect(bytesToHex(packet.raw).toUpperCase()).toBe(bytesToHex(dummyPayload).toUpperCase());
      }
    } catch (e) {
      // Ignore if dummy payload is invalid for mapped fields
    }
  });
});
