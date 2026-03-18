import { describe, it, expect } from 'vitest';
import { ScaleForgetPacket } from '@/protocol/scale/ScaleForgetPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { PayloadMapper } from '@/protocol/decorators';

describe('ScaleForgetPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new ScaleForgetPacket();
    expect(packet.opcode).toBe(BoksOpcode.SCALE_FORGET_BONDING);
    // 0x53 0x00 CS
    expect(bytesToHex(packet.encode())).toBe('530053');
  });

  it('should parse from payload correctly', () => {
    const packet = ScaleForgetPacket.fromPayload(new Uint8Array(0));
    expect(packet.opcode).toBe(BoksOpcode.SCALE_FORGET_BONDING);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new ScaleForgetPacket();
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
