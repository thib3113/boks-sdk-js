import { describe, it, expect } from 'vitest';
import { DoorCloseHistoryPacket } from '@/protocol/uplink/history/DoorCloseHistoryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { PayloadMapper } from '@/protocol/decorators';

describe('DoorCloseHistoryPacket', () => {
  it('should parse correctly with age', () => {
    const payload = new Uint8Array([0x01, 0x02, 0x03]);
    const packet = DoorCloseHistoryPacket.fromPayload(payload);
    expect(packet.opcode).toBe(BoksOpcode.LOG_DOOR_CLOSE);
    expect(packet.age).toBe(0x010203);
    expect(packet.status).toBe('closed');
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new DoorCloseHistoryPacket({ age: 50 });
    // Opcode 0x90, Len 3, Age 50 (000032), Checksum 0xC5 (144+3+50=197)
    expect(bytesToHex(packet.encode())).toBe('9003000032C5');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = DoorCloseHistoryPacket.fromPayload(new Uint8Array([0x01, 0x02, 0x03]));
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
