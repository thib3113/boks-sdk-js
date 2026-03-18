import { describe, it, expect } from 'vitest';
import { TestBatteryPacket } from '@/protocol/downlink/TestBatteryPacket';
import { BoksOpcode } from '@/protocol/constants';
import { bytesToHex } from '@/utils/converters';
import { PayloadMapper } from '@/protocol/decorators';

describe('TestBatteryPacket', () => {
  it('should construct and encode correctly', () => {
    const packet = new TestBatteryPacket();
    expect(packet.opcode).toBe(BoksOpcode.TEST_BATTERY);
    // 0x08 + 0x00 + Checksum(08)
    expect(bytesToHex(packet.encode())).toBe('080008');
  });

  it('should parse from payload correctly', () => {
    const packet = TestBatteryPacket.fromPayload(new Uint8Array(0));
    expect(packet).toBeInstanceOf(TestBatteryPacket);
    expect(packet.opcode).toBe(BoksOpcode.TEST_BATTERY);
  });

  it('should output only mapped payload properties and opcode via toJSON', () => {
    const packet = new TestBatteryPacket();
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
