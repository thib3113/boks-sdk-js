import { describe, it, expect } from 'vitest';
import { ScaleGetMacPacket } from '@/protocol/scale/ScaleGetMacPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { PayloadMapper } from '@/protocol/decorators';

describe('ScaleGetMacPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new ScaleGetMacPacket();
    expect(packet.opcode).toBe(BoksOpcode.SCALE_GET_MAC_ADDRESS_BOKS);
    expect(bytesToHex(packet.encode())).toBe('520052');
  });

  it('should parse from payload correctly', () => {
    const packet = ScaleGetMacPacket.fromPayload(new Uint8Array(0));
    expect(packet.opcode).toBe(BoksOpcode.SCALE_GET_MAC_ADDRESS_BOKS);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new ScaleGetMacPacket();
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
