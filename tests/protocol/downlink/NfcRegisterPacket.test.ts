import { describe, it, expect } from 'vitest';
import { BoksProtocolErrorId } from '../../../src/errors/BoksProtocolError';
import { NfcRegisterPacket } from '@/protocol/downlink/NfcRegisterPacket';
import { bytesToHex } from '@/utils/converters';

describe('NfcRegisterPacket', () => {
  it('should generate correct binary for RegisterNfcTag (0x18)', () => {
    const packet = new NfcRegisterPacket('AABBCCDD', "04:A1:B2:C3");
    expect(bytesToHex(packet.encode())).toBe('180D41414242434344440404A1B2C357');
  });
});



