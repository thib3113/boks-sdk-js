import { describe, it, expect } from 'vitest';
import { BoksProtocolErrorId } from '../../../src/errors/BoksProtocolError';
import { TestBatteryPacket } from '@/protocol/downlink/TestBatteryPacket';
import { bytesToHex } from '@/utils/converters';

describe('TestBatteryPacket', () => {
  it('should generate correct binary for TestBattery (0x08)', () => {
    const packet = new TestBatteryPacket();
    expect(bytesToHex(packet.encode())).toBe('080008');
  });
});



