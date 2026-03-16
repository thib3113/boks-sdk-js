import { BoksProtocolError } from '@/errors/BoksProtocolError';
import { describe, it, expect } from 'vitest';
import { NotifyMacAddressBoksScalePacket } from '@/protocol/scale/NotifyMacAddressBoksScalePacket';
import { BoksOpcode } from '@/protocol/constants';

describe('NotifyMacAddressBoksScalePacket', () => {
  it('should parse correctly', () => {
    // AA:BB:CC:DD:EE:FF
    const payload = new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff]);
    const packet = NotifyMacAddressBoksScalePacket.fromPayload(payload);

    expect(packet.opcode).toBe(BoksOpcode.NOTIFY_MAC_ADDRESS_BOKS_SCALE);
    expect(packet.macAddress).toBe('FF:EE:DD:CC:BB:AA');
  });

  it('should handle empty payload', () => {
    const payload = new Uint8Array(0);
    expect(() => NotifyMacAddressBoksScalePacket.fromPayload(payload)).toThrowError(
      BoksProtocolError
    );
  });
});
