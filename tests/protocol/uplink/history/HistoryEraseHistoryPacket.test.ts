import { describe, it, expect } from 'vitest';
import { HistoryEraseHistoryPacket } from '@/protocol/uplink/history/HistoryEraseHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { PayloadMapper } from '@/protocol/decorators';

describe('HistoryEraseHistoryPacket', () => {
  it('should parse correctly with age', () => {
    const payload = new Uint8Array([0x01, 0x02, 0x03]);
    const packet = HistoryEraseHistoryPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.LOG_HISTORY_ERASE);
    expect(packet.age).toBe(0x010203);
  });

  it('should encode correctly', () => {
    const packet = new HistoryEraseHistoryPacket({ age: 1 });
    const encoded = packet.encode();
    // 0x93 + 3 + 000001
    expect(encoded[0]).toBe(0x93);
    expect(encoded[1]).toBe(3);
    expect(bytesToHex(encoded.subarray(2, 5))).toBe('000001');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = HistoryEraseHistoryPacket.fromPayload(new Uint8Array([0x01, 0x02, 0x03]));
    const json = packet.toJSON();
    expect(json).toStrictEqual(
        Object.assign({ opcode: packet.opcode },
        Object.fromEntries(
            PayloadMapper.getFields(packet.constructor)
            .map((f: any) => [f.propertyName, (packet as any)[f.propertyName]])
        ))
    );
  });
});
