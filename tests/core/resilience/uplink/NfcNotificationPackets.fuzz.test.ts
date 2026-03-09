import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NotifyNfcTagRegisteredPacket } from '../../../../src/protocol/uplink/NotifyNfcTagRegisteredPacket';
import { NotifyNfcTagRegisteredErrorAlreadyExistsPacket } from '../../../../src/protocol/uplink/NotifyNfcTagRegisteredErrorAlreadyExistsPacket';
import { NotifyNfcTagUnregisteredPacket } from '../../../../src/protocol/uplink/NotifyNfcTagUnregisteredPacket';
import { ErrorNfcTagAlreadyExistsScanPacket } from '../../../../src/protocol/uplink/ErrorNfcTagAlreadyExistsScanPacket';
import { ErrorNfcScanTimeoutPacket } from '../../../../src/protocol/uplink/ErrorNfcScanTimeoutPacket';

describe('NfcNotificationPackets Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: NotifyNfcTagRegisteredPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 0, maxLength: 256 }),
        (payload) => {
          const packet = NotifyNfcTagRegisteredPacket.fromPayload(payload);
          expect(packet).toBeInstanceOf(NotifyNfcTagRegisteredPacket);
          expect(packet.opcode).toBe(0xC8);
          expect((packet as any).rawPayload).toEqual(payload);
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyNfcTagRegisteredErrorAlreadyExistsPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 0, maxLength: 256 }),
        (payload) => {
          const packet = NotifyNfcTagRegisteredErrorAlreadyExistsPacket.fromPayload(payload);
          expect(packet).toBeInstanceOf(NotifyNfcTagRegisteredErrorAlreadyExistsPacket);
          expect(packet.opcode).toBe(0xC9);
          expect((packet as any).rawPayload).toEqual(payload);
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyNfcTagUnregisteredPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 0, maxLength: 256 }),
        (payload) => {
          const packet = NotifyNfcTagUnregisteredPacket.fromPayload(payload);
          expect(packet).toBeInstanceOf(NotifyNfcTagUnregisteredPacket);
          expect(packet.opcode).toBe(0xCA);
          expect((packet as any).rawPayload).toEqual(payload);
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ErrorNfcTagAlreadyExistsScanPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 0, maxLength: 256 }),
        (payload) => {
          const packet = ErrorNfcTagAlreadyExistsScanPacket.fromPayload(payload);
          expect(packet).toBeInstanceOf(ErrorNfcTagAlreadyExistsScanPacket);
          expect(packet.opcode).toBe(0xC6);
          expect((packet as any).rawPayload).toEqual(payload);
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ErrorNfcScanTimeoutPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 0, maxLength: 256 }),
        (payload) => {
          const packet = ErrorNfcScanTimeoutPacket.fromPayload(payload);
          expect(packet).toBeInstanceOf(ErrorNfcScanTimeoutPacket);
          expect(packet.opcode).toBe(0xC7);
          expect((packet as any).rawPayload).toEqual(payload);
        }
      ),
      { numRuns: 1000 }
    );
  });
});
