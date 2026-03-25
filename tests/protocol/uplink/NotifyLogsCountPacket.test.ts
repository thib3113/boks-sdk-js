import { describe, it, expect } from 'vitest';
import { NotifyLogsCountPacket } from '@/protocol/uplink/NotifyLogsCountPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { buildMockRawPacket } from '../../../utils/packet-builder';

describe('NotifyLogsCountPacket', () => {
  it('should parse correctly', () => {
    // 0x0100 -> 256
    const payload = new Uint8Array([0x01, 0x00]);
    const packet = NotifyLogsCountPacket.fromRaw(buildMockRawPacket(NotifyLogsCountPacket.opcode, payload));

    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_LOGS_COUNT);
    expect(packet.count).toBe(256);
  });

  it('should match fixed hexadecimal reference encoding', () => {
    const packet = new NotifyLogsCountPacket(1234);
    const encoded = packet.encode();
    // Opcode 0x79, Len 2, Count 1234 (04D2), Checksum 0x51 (121+2+4+210=337, 337%256=81=0x51)
    expect(bytesToHex(encoded)).toBe('790204D251');
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = NotifyLogsCountPacket.fromRaw(buildMockRawPacket(NotifyLogsCountPacket.opcode, new Uint8Array([0x01, 0x00])));
    const json = packet.toJSON();
    expect(json).toStrictEqual({
        "count": 256,
        "opcode": 121,
      });
  });
});
