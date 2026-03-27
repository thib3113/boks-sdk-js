import { NotifyNfcTagFoundPacket } from '../../../../src/protocol/uplink/NotifyNfcTagFoundPacket';
import { BoksProtocolError } from '../../../../src/errors/BoksProtocolError';
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NotifyNfcTagRegisteredPacket } from '../../../../src/protocol/uplink/NotifyNfcTagRegisteredPacket';
import { NotifyNfcTagRegisteredErrorAlreadyExistsPacket } from '../../../../src/protocol/uplink/NotifyNfcTagRegisteredErrorAlreadyExistsPacket';
import { NotifyNfcTagUnregisteredPacket } from '../../../../src/protocol/uplink/NotifyNfcTagUnregisteredPacket';
import { ErrorNfcTagAlreadyExistsScanPacket } from '../../../../src/protocol/uplink/ErrorNfcTagAlreadyExistsScanPacket';
import { ErrorNfcScanTimeoutPacket } from '../../../../src/protocol/uplink/ErrorNfcScanTimeoutPacket';

describe('NfcNotificationPackets Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: NotifyNfcTagFoundPacket should safely handle arbitrary payload lengths and parse uid', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          const packet = NotifyNfcTagFoundPacket.fromRaw(payload);
          expect(packet).toBeInstanceOf(NotifyNfcTagFoundPacket);
          expect(packet.opcode).toBe(0xc5);
          expect((packet as any).raw).toEqual(payload);
          expect(typeof packet.uid).toBe('string');
        } catch (e) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyNfcTagRegisteredPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NotifyNfcTagRegisteredPacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(NotifyNfcTagRegisteredPacket);
        expect(packet.opcode).toBe(0xc8);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyNfcTagRegisteredErrorAlreadyExistsPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NotifyNfcTagRegisteredErrorAlreadyExistsPacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(NotifyNfcTagRegisteredErrorAlreadyExistsPacket);
        expect(packet.opcode).toBe(0xc9);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyNfcTagUnregisteredPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NotifyNfcTagUnregisteredPacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(NotifyNfcTagUnregisteredPacket);
        expect(packet.opcode).toBe(0xca);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ErrorNfcTagAlreadyExistsScanPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ErrorNfcTagAlreadyExistsScanPacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(ErrorNfcTagAlreadyExistsScanPacket);
        expect(packet.opcode).toBe(0xc6);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ErrorNfcScanTimeoutPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ErrorNfcScanTimeoutPacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(ErrorNfcScanTimeoutPacket);
        expect(packet.opcode).toBe(0xc7);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });
});
