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
  describe('NotifyCodeGenerationProgressPacket', () => {
    it('FEATURE REGRESSION: should parse progress correctly for valid payloads', () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 1, maxLength: 256 }), (payload) => {
          if (payload[0] > 100) return; const packet = NotifyCodeGenerationProgressPacket.fromRaw(payload);
          expect(packet).toBeInstanceOf(NotifyCodeGenerationProgressPacket);
          expect(packet.opcode).toBe(0xc2);
          expect((packet as any).raw).toEqual(payload);
          expect(packet.progress).toBe(payload[0]);
        }),
        { numRuns: 1000 }
      );
    });

    it('FEATURE REGRESSION: should throw a detailed BoksProtocolError for payloads that are too short', () => {
      fc.assert(
        fc.property(fc.uint8Array({ maxLength: 0 }), (payload) => {
          try {
            NotifyCodeGenerationProgressPacket.fromRaw(payload);
            expect.unreachable('Should have thrown an error');
          } catch (error: any) {
            expect(error.name).toBe('BoksProtocolError');
            expect(error.context).toBeDefined();
            expect(error.context.received).toBe(0);
            expect(error.context.expected).toBe(1);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('AnswerDoorStatusPacket', () => {
    it('FEATURE REGRESSION: should set isOpen properly for valid payloads', () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 2, maxLength: 256 }).map((arr) => {
            const clone = new Uint8Array(arr);
            clone[0] = clone[0] % 2;
            clone[1] = clone[1] % 2;
            return clone;
          }),
          (payload) => {
            const packet = AnswerDoorStatusPacket.fromRaw(payload);
            expect(packet).toBeInstanceOf(AnswerDoorStatusPacket);
            expect(packet.opcode).toBe(0x85);
            expect((packet as any).raw).toEqual(payload);
            expect(packet.isOpen).toBe(payload[1] === 0x01 && payload[0] === 0x00);
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('FEATURE REGRESSION: should throw a detailed BoksProtocolError for payloads that are too short', () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 0, maxLength: 1 }), (payload) => {
          try {
            AnswerDoorStatusPacket.fromRaw(payload);
            expect.unreachable('Should have thrown an error');
          } catch (error: any) {
            expect(error.name).toBe('BoksProtocolError');
            expect(error.context).toBeDefined();
            expect(error.context.received).toBe(payload.length);
            expect(error.context.expected).toBe(2);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('NotifyDoorStatusPacket', () => {
    it('FEATURE REGRESSION: should set isOpen properly for valid payloads', () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 2, maxLength: 256 }).map((arr) => {
            const clone = new Uint8Array(arr);
            clone[0] = clone[0] % 2;
            clone[1] = clone[1] % 2;
            return clone;
          }),
          (payload) => {
            const packet = NotifyDoorStatusPacket.fromRaw(payload);
            expect(packet).toBeInstanceOf(NotifyDoorStatusPacket);
            expect(packet.opcode).toBe(0x84);
            expect((packet as any).raw).toEqual(payload);
            expect(packet.isOpen).toBe(payload[1] === 0x01 && payload[0] === 0x00);
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('FEATURE REGRESSION: should throw a detailed BoksProtocolError for payloads that are too short', () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 0, maxLength: 1 }), (payload) => {
          try {
            NotifyDoorStatusPacket.fromRaw(payload);
            expect.unreachable('Should have thrown an error');
          } catch (error: any) {
            expect(error.name).toBe('BoksProtocolError');
            expect(error.context).toBeDefined();
            expect(error.context.received).toBe(payload.length);
            expect(error.context.expected).toBe(2);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('NotifyCodesCountPacket', () => {
    it('FEATURE REGRESSION: should parse counts from DataView for valid payloads', () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 4, maxLength: 256 }), (payload) => {
          const packet = NotifyCodesCountPacket.fromRaw(payload);
          expect(packet).toBeInstanceOf(NotifyCodesCountPacket);
          expect(packet.opcode).toBe(0xc3);
          expect((packet as any).raw).toEqual(payload);
          const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
          expect(packet.masterCount).toBe(view.getUint16(0, false));
          expect(packet.otherCount).toBe(view.getUint16(2, false));
        }),
        { numRuns: 1000 }
      );
    });

    it('FEATURE REGRESSION: should throw a detailed BoksProtocolError for payloads that are too short', () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 0, maxLength: 3 }), (payload) => {
          try {
            NotifyCodesCountPacket.fromRaw(payload);
            expect.unreachable('Should have thrown an error');
          } catch (error: any) {
            expect(error.name).toBe('BoksProtocolError');
            expect(error.context).toBeDefined();
            expect(error.context.received).toBe(payload.length);
            expect(error.context.expected).toBe(4);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('NotifyLogsCountPacket', () => {
    it('FEATURE REGRESSION: should parse count from DataView for valid payloads', () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 2, maxLength: 256 }), (payload) => {
          const packet = NotifyLogsCountPacket.fromRaw(payload);
          expect(packet).toBeInstanceOf(NotifyLogsCountPacket);
          expect(packet.opcode).toBe(0x79);
          expect((packet as any).raw).toEqual(payload);
          const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
          expect(packet.count).toBe(view.getUint16(0, false));
        }),
        { numRuns: 1000 }
      );
    });

    it('FEATURE REGRESSION: should throw a detailed BoksProtocolError for payloads that are too short', () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 0, maxLength: 1 }), (payload) => {
          try {
            NotifyLogsCountPacket.fromRaw(payload);
            expect.unreachable('Should have thrown an error');
          } catch (error: any) {
            expect(error.name).toBe('BoksProtocolError');
            expect(error.context).toBeDefined();
            expect(error.context.received).toBe(payload.length);
            expect(error.context.expected).toBe(2);
          }
        }),
        { numRuns: 100 }
      );
    });
  });
  it('FEATURE REGRESSION: EndHistoryPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = EndHistoryPacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(EndHistoryPacket);
        expect(packet.opcode).toBe(0x92);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ErrorBadRequestPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ErrorBadRequestPacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(ErrorBadRequestPacket);
        expect(packet.opcode).toBe(0xe2);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ErrorCrcPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ErrorCrcPacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(ErrorCrcPacket);
        expect(packet.opcode).toBe(0xe0);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ErrorUnauthorizedPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ErrorUnauthorizedPacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(ErrorUnauthorizedPacket);
        expect(packet.opcode).toBe(0xe1);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: InvalidOpenCodePacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = InvalidOpenCodePacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(InvalidOpenCodePacket);
        expect(packet.opcode).toBe(0x82);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyCodeGenerationErrorPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NotifyCodeGenerationErrorPacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(NotifyCodeGenerationErrorPacket);
        expect(packet.opcode).toBe(0xc1);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifyCodeGenerationSuccessPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NotifyCodeGenerationSuccessPacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(NotifyCodeGenerationSuccessPacket);
        expect(packet.opcode).toBe(0xc0);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: NotifySetConfigurationSuccessPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = NotifySetConfigurationSuccessPacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(NotifySetConfigurationSuccessPacket);
        expect(packet.opcode).toBe(0xc4);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: OperationSuccessPacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = OperationSuccessPacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(OperationSuccessPacket);
        expect(packet.opcode).toBe(0x77);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  it('FEATURE REGRESSION: ValidOpenCodePacket should safely handle arbitrary payload lengths', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        const packet = ValidOpenCodePacket.fromRaw(payload);
        expect(packet).toBeInstanceOf(ValidOpenCodePacket);
        expect(packet.opcode).toBe(0x81);
        expect((packet as any).raw).toEqual(payload);
      }),
      { numRuns: 1000 }
    );
  });

  describe('OperationErrorPacket', () => {
    it('FEATURE REGRESSION: should parse error code from first byte for valid payloads', () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 1, maxLength: 256 }), (payload) => {
          const packet = OperationErrorPacket.fromRaw(payload);
          expect(packet).toBeInstanceOf(OperationErrorPacket);
          expect(packet.opcode).toBe(0x78);
          expect(packet.errorCode).toBe(payload[0]);
          expect((packet as any).raw).toEqual(payload);
        }),
        { numRuns: 1000 }
      );
    });

    it('FEATURE REGRESSION: should throw a detailed BoksProtocolError for payloads that are too short', () => {
      fc.assert(
        fc.property(fc.uint8Array({ maxLength: 0 }), (payload) => {
          try {
            OperationErrorPacket.fromRaw(payload);
            expect.unreachable('Should have thrown an error');
          } catch (error: any) {
            expect(error.name).toBe('BoksProtocolError');
            expect(error.context).toBeDefined();
            expect(error.context.received).toBe(0);
            expect(error.context.expected).toBe(1);
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
