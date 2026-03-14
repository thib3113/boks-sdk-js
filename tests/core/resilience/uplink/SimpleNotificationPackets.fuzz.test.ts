import { NotifyCodeGenerationProgressPacket } from '../../../../src/protocol/uplink/NotifyCodeGenerationProgressPacket';
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { EndHistoryPacket } from '../../../../src/protocol/uplink/EndHistoryPacket';
import { ErrorBadRequestPacket } from '../../../../src/protocol/uplink/ErrorBadRequestPacket';
import { ErrorCrcPacket } from '../../../../src/protocol/uplink/ErrorCrcPacket';
import { ErrorUnauthorizedPacket } from '../../../../src/protocol/uplink/ErrorUnauthorizedPacket';
import { InvalidOpenCodePacket } from '../../../../src/protocol/uplink/InvalidOpenCodePacket';
import { NotifyCodeGenerationErrorPacket } from '../../../../src/protocol/uplink/NotifyCodeGenerationErrorPacket';
import { NotifyCodeGenerationSuccessPacket } from '../../../../src/protocol/uplink/NotifyCodeGenerationSuccessPacket';
import { NotifySetConfigurationSuccessPacket } from '../../../../src/protocol/uplink/NotifySetConfigurationSuccessPacket';
import { OperationSuccessPacket } from '../../../../src/protocol/uplink/OperationSuccessPacket';
import { ValidOpenCodePacket } from '../../../../src/protocol/uplink/ValidOpenCodePacket';
import { OperationErrorPacket } from '../../../../src/protocol/uplink/OperationErrorPacket';
import { AnswerDoorStatusPacket } from '../../../../src/protocol/uplink/AnswerDoorStatusPacket';
import { NotifyDoorStatusPacket } from '../../../../src/protocol/uplink/NotifyDoorStatusPacket';
import { NotifyCodesCountPacket } from '../../../../src/protocol/uplink/NotifyCodesCountPacket';
import { NotifyLogsCountPacket } from '../../../../src/protocol/uplink/NotifyLogsCountPacket';

describe('SimpleNotificationPackets Resilience (Fuzzing)', () => {

  it('FEATURE REGRESSION: NotifyCodeGenerationProgressPacket should safely handle arbitrary payload lengths and parse progress', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NotifyCodeGenerationProgressPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(NotifyCodeGenerationProgressPacket);
        expect(packet.opcode).toBe(0xC2);
        expect((packet as any).rawPayload).toEqual(payload);
        if (payload.length > 0) {
          expect(packet.progress).toBe(payload[0]);
        } else {
          expect(packet.progress).toBe(0);
        }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: AnswerDoorStatusPacket should safely handle arbitrary payload lengths and set isOpen properly', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        let packet;
        try {
          packet = AnswerDoorStatusPacket.fromPayload(payload);
        } catch(e) { return; }
        expect(packet).toBeInstanceOf(AnswerDoorStatusPacket);
        expect(packet.opcode).toBe(0x85);
        expect((packet as any).rawPayload).toEqual(payload);
        if (payload.length >= 2) {
          expect(packet.isOpen).toBe(payload[1] === 0x01 && payload[0] === 0x00);
        } else {
          expect(packet.isOpen).toBe(false);
        }
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyDoorStatusPacket should safely handle arbitrary payload lengths and set isOpen properly', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 2, maxLength: 256 }), (payload) => {
        let packet;
        try {
          packet = NotifyDoorStatusPacket.fromPayload(payload);
        } catch(e) { return; }
        expect(packet).toBeInstanceOf(NotifyDoorStatusPacket);
        expect(packet.opcode).toBe(0x84);
        expect((packet as any).rawPayload).toEqual(payload);
        expect(packet.isOpen).toBe(payload[1] === 0x01 && payload[0] === 0x00);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyCodesCountPacket should safely handle arbitrary payload lengths and parse counts from DataView', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 4, maxLength: 256 }), (payload) => {
        const packet = NotifyCodesCountPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(NotifyCodesCountPacket);
        expect(packet.opcode).toBe(0xC3);
        expect((packet as any).rawPayload).toEqual(payload);
        const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
        expect(packet.masterCount).toBe(view.getUint16(0, false));
        expect(packet.otherCount).toBe(view.getUint16(2, false));
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyLogsCountPacket should safely handle arbitrary payload lengths and parse count from DataView', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NotifyLogsCountPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(NotifyLogsCountPacket);
        expect(packet.opcode).toBe(0x79);
        expect((packet as any).rawPayload).toEqual(payload);
        if (payload.length >= 2) {
          const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
          expect(packet.count).toBe(view.getUint16(0, false));
        } else {
          expect(packet.count).toBe(0);
        }
      }),
      { numRuns: 1000 }
    );
  });
  it('FEATURE REGRESSION: EndHistoryPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = EndHistoryPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(EndHistoryPacket);
        expect(packet.opcode).toBe(0x92);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ErrorBadRequestPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ErrorBadRequestPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(ErrorBadRequestPacket);
        expect(packet.opcode).toBe(0xE2);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ErrorCrcPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ErrorCrcPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(ErrorCrcPacket);
        expect(packet.opcode).toBe(0xE0);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ErrorUnauthorizedPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ErrorUnauthorizedPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(ErrorUnauthorizedPacket);
        expect(packet.opcode).toBe(0xE1);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: InvalidOpenCodePacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = InvalidOpenCodePacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(InvalidOpenCodePacket);
        expect(packet.opcode).toBe(0x82);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyCodeGenerationErrorPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NotifyCodeGenerationErrorPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(NotifyCodeGenerationErrorPacket);
        expect(packet.opcode).toBe(0xC1);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyCodeGenerationSuccessPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NotifyCodeGenerationSuccessPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(NotifyCodeGenerationSuccessPacket);
        expect(packet.opcode).toBe(0xC0);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifySetConfigurationSuccessPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NotifySetConfigurationSuccessPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(NotifySetConfigurationSuccessPacket);
        expect(packet.opcode).toBe(0xC4);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: OperationSuccessPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = OperationSuccessPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(OperationSuccessPacket);
        expect(packet.opcode).toBe(0x77);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ValidOpenCodePacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ValidOpenCodePacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(ValidOpenCodePacket);
        expect(packet.opcode).toBe(0x81);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: OperationErrorPacket should safely parse error code from first byte or default to 0', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = OperationErrorPacket.fromPayload(payload);
        expect(packet).toBeInstanceOf(OperationErrorPacket);
        expect(packet.opcode).toBe(0x78);
        expect(packet.errorCode).toBe(payload.length > 0 ? payload[0] : 0);
        expect((packet as any).rawPayload).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });
});
