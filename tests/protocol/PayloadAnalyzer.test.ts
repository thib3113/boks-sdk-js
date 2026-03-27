import { describe, expect, it } from 'vitest';
import { PayloadMapper } from '../../src/protocol/decorators/PayloadMapper';
import { PayloadPinCode } from '../../src/protocol/decorators/PayloadPinCode';
import { PayloadConfigKey } from '../../src/protocol/decorators/PayloadConfigKey';
import { PacketDescriptor } from '../../src/protocol/decorators/PacketDescriptor';

@PacketDescriptor({})
class MultiFieldPacket {
  @PayloadPinCode(0)
  accessor pin1!: string;

  @PayloadConfigKey(6)
  accessor config1!: string;

  @PayloadPinCode(14)
  accessor pin2!: string;

  @PayloadConfigKey(20)
  accessor config2!: string;
}

describe('PayloadAnalyzer Multi Field support', () => {
  it('should compile and process multiple fields of the same type without variable collision', () => {
    const packet = new MultiFieldPacket();
    packet.pin1 = '123456';
    packet.config1 = 'A1B2C3D4';
    packet.pin2 = '654321';
    packet.config2 = 'E5F6A7B8';

    // Serialize
    const payload = PayloadMapper.serialize(packet);
    expect(payload.length).toBe(28); // 6 + 8 + 6 + 8

    // Parse
    const parsed = PayloadMapper.parse<MultiFieldPacket>(MultiFieldPacket, payload, { strict: false });

    expect(parsed.pin1).toBe('123456');
    expect(parsed.config1).toBe('A1B2C3D4');
    expect(parsed.pin2).toBe('654321');
    expect(parsed.config2).toBe('E5F6A7B8');

    // Validate
    expect(() => PayloadMapper.validate(packet)).not.toThrow();
  });
});
