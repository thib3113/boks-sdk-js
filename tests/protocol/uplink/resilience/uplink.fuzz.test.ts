import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { BoksProtocolError } from '../../../../src/errors/BoksProtocolError';

import { AnswerDoorStatusPacket } from '../../../../src/protocol/uplink/AnswerDoorStatusPacket';
import { EndHistoryPacket } from '../../../../src/protocol/uplink/EndHistoryPacket';
import { ErrorBadRequestPacket } from '../../../../src/protocol/uplink/ErrorBadRequestPacket';
import { ErrorCrcPacket } from '../../../../src/protocol/uplink/ErrorCrcPacket';
import { ErrorNfcScanTimeoutPacket } from '../../../../src/protocol/uplink/ErrorNfcScanTimeoutPacket';
import { ErrorNfcTagAlreadyExistsScanPacket } from '../../../../src/protocol/uplink/ErrorNfcTagAlreadyExistsScanPacket';
import { ErrorUnauthorizedPacket } from '../../../../src/protocol/uplink/ErrorUnauthorizedPacket';
import { InvalidOpenCodePacket } from '../../../../src/protocol/uplink/InvalidOpenCodePacket';
import { NotifyCodeGenerationErrorPacket } from '../../../../src/protocol/uplink/NotifyCodeGenerationErrorPacket';
import { NotifyCodeGenerationProgressPacket } from '../../../../src/protocol/uplink/NotifyCodeGenerationProgressPacket';
import { NotifyCodeGenerationSuccessPacket } from '../../../../src/protocol/uplink/NotifyCodeGenerationSuccessPacket';
import { NotifyCodesCountPacket } from '../../../../src/protocol/uplink/NotifyCodesCountPacket';
import { NotifyDoorStatusPacket } from '../../../../src/protocol/uplink/NotifyDoorStatusPacket';
import { NotifyLogsCountPacket } from '../../../../src/protocol/uplink/NotifyLogsCountPacket';
import { NotifyNfcTagFoundPacket } from '../../../../src/protocol/uplink/NotifyNfcTagFoundPacket';
import { NotifyNfcTagRegisteredErrorAlreadyExistsPacket } from '../../../../src/protocol/uplink/NotifyNfcTagRegisteredErrorAlreadyExistsPacket';
import { NotifyNfcTagRegisteredPacket } from '../../../../src/protocol/uplink/NotifyNfcTagRegisteredPacket';
import { NotifyNfcTagUnregisteredPacket } from '../../../../src/protocol/uplink/NotifyNfcTagUnregisteredPacket';
import { NotifySetConfigurationSuccessPacket } from '../../../../src/protocol/uplink/NotifySetConfigurationSuccessPacket';
import { OperationErrorPacket } from '../../../../src/protocol/uplink/OperationErrorPacket';
import { OperationSuccessPacket } from '../../../../src/protocol/uplink/OperationSuccessPacket';
import { ValidOpenCodePacket } from '../../../../src/protocol/uplink/ValidOpenCodePacket';

const UPLINK_PACKETS = [
  AnswerDoorStatusPacket,
  EndHistoryPacket,
  ErrorBadRequestPacket,
  ErrorCrcPacket,
  ErrorNfcScanTimeoutPacket,
  ErrorNfcTagAlreadyExistsScanPacket,
  ErrorUnauthorizedPacket,
  InvalidOpenCodePacket,
  NotifyCodeGenerationErrorPacket,
  NotifyCodeGenerationProgressPacket,
  NotifyCodeGenerationSuccessPacket,
  NotifyCodesCountPacket,
  NotifyDoorStatusPacket,
  NotifyLogsCountPacket,
  NotifyNfcTagFoundPacket,
  NotifyNfcTagRegisteredErrorAlreadyExistsPacket,
  NotifyNfcTagRegisteredPacket,
  NotifyNfcTagUnregisteredPacket,
  NotifySetConfigurationSuccessPacket,
  OperationErrorPacket,
  OperationSuccessPacket,
  ValidOpenCodePacket
];

describe('Uplink Packets Resilience (Fuzzing)', () => {
  for (const PacketClass of UPLINK_PACKETS) {
    it(`FEATURE REGRESSION: ${PacketClass.name}.fromPayload should securely reject malformed binary payloads with BoksProtocolError`, () => {
      fc.assert(
        fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
          try {
            const packet = PacketClass.fromPayload(payload);
            expect(packet).toBeInstanceOf(PacketClass);
          } catch (e) {
            expect(e).toBeInstanceOf(BoksProtocolError);
          }
        }),
        { numRuns: 100 }
      );
    });
  }
});
