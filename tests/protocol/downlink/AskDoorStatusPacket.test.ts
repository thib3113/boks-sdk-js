import { describe, it, expect } from 'vitest';
import { BoksProtocolErrorId } from '../../../src/errors/BoksProtocolError';
import { AskDoorStatusPacket } from '@/protocol/downlink/AskDoorStatusPacket';
import { bytesToHex } from '@/utils/converters';

describe('AskDoorStatusPacket', () => {
  it('should generate correct binary for AskDoorStatus (0x02)', () => {
    const packet = new AskDoorStatusPacket();
    expect(bytesToHex(packet.encode())).toBe('020002');
  });
});



