import { BoksPacket, BoksPacketConstructor, BoksPacketOptions } from './_BoksPacketBase';

// Scale Notifications
import { NotifyScaleBondingSuccessPacket } from './scale/NotifyScaleBondingSuccessPacket';
import { NotifyScaleBondingErrorPacket } from './scale/NotifyScaleBondingErrorPacket';
import { NotifyMacAddressBoksScalePacket } from './scale/NotifyMacAddressBoksScalePacket';
import { NotifyScaleBondingForgetSuccessPacket } from './scale/NotifyScaleBondingForgetSuccessPacket';
import { NotifyScaleBondingProgressPacket } from './scale/NotifyScaleBondingProgressPacket';
import { NotifyScaleTareEmptyOkPacket } from './scale/NotifyScaleTareEmptyOkPacket';
import { NotifyScaleTareLoadedOkPacket } from './scale/NotifyScaleTareLoadedOkPacket';
import { NotifyScaleMeasureWeightPacket } from './scale/NotifyScaleMeasureWeightPacket';
import { NotifyScaleDisconnectedPacket } from './scale/NotifyScaleDisconnectedPacket';
import { NotifyScaleRawSensorsPacket } from './scale/NotifyScaleRawSensorsPacket';
import { NotifyScaleFaultyPacket } from './scale/NotifyScaleFaultyPacket';

// RX / Notifications
import { OperationSuccessPacket } from './uplink/OperationSuccessPacket';
import { OperationErrorPacket } from './uplink/OperationErrorPacket';
import { NotifyLogsCountPacket } from './uplink/NotifyLogsCountPacket';
import { ValidOpenCodePacket } from './uplink/ValidOpenCodePacket';
import { InvalidOpenCodePacket } from './uplink/InvalidOpenCodePacket';
import { NotifyDoorStatusPacket } from './uplink/NotifyDoorStatusPacket';
import { AnswerDoorStatusPacket } from './uplink/AnswerDoorStatusPacket';
import { NotifyCodesCountPacket } from './uplink/NotifyCodesCountPacket';
import { NotifyNfcTagFoundPacket } from './uplink/NotifyNfcTagFoundPacket';
import { ErrorNfcTagAlreadyExistsScanPacket } from './uplink/ErrorNfcTagAlreadyExistsScanPacket';
import { ErrorNfcScanTimeoutPacket } from './uplink/ErrorNfcScanTimeoutPacket';
import { NotifyNfcTagRegisteredPacket } from './uplink/NotifyNfcTagRegisteredPacket';
import { NotifyNfcTagRegisteredErrorAlreadyExistsPacket } from './uplink/NotifyNfcTagRegisteredErrorAlreadyExistsPacket';
import { NotifyNfcTagUnregisteredPacket } from './uplink/NotifyNfcTagUnregisteredPacket';
import { EndHistoryPacket } from './uplink/EndHistoryPacket';
import { NotifyCodeGenerationSuccessPacket } from './uplink/NotifyCodeGenerationSuccessPacket';
import { NotifyCodeGenerationErrorPacket } from './uplink/NotifyCodeGenerationErrorPacket';
import { NotifyCodeGenerationProgressPacket } from './uplink/NotifyCodeGenerationProgressPacket';
import { NotifySetConfigurationSuccessPacket } from './uplink/NotifySetConfigurationSuccessPacket';
import { ErrorCrcPacket } from './uplink/ErrorCrcPacket';
import { ErrorUnauthorizedPacket } from './uplink/ErrorUnauthorizedPacket';
import { ErrorBadRequestPacket } from './uplink/ErrorBadRequestPacket';
import { UnknownPacket } from './uplink/UnknownPacket';

// Logs
import { CodeBleValidHistoryPacket } from './uplink/history/CodeBleValidHistoryPacket';
import { CodeBleInvalidHistoryPacket } from './uplink/history/CodeBleInvalidHistoryPacket';
import { CodeKeyValidHistoryPacket } from './uplink/history/CodeKeyValidHistoryPacket';
import { CodeKeyInvalidHistoryPacket } from './uplink/history/CodeKeyInvalidHistoryPacket';
import { DoorOpenHistoryPacket } from './uplink/history/DoorOpenHistoryPacket';
import { DoorCloseHistoryPacket } from './uplink/history/DoorCloseHistoryPacket';
import { HistoryEraseHistoryPacket } from './uplink/history/HistoryEraseHistoryPacket';
import { PowerOnHistoryPacket } from './uplink/history/PowerOnHistoryPacket';
import { PowerOffHistoryPacket } from './uplink/history/PowerOffHistoryPacket';
import { BlockResetHistoryPacket } from './uplink/history/BlockResetHistoryPacket';
import { BleRebootHistoryPacket } from './uplink/history/BleRebootHistoryPacket';
import { ScaleMeasureHistoryPacket } from './uplink/history/ScaleMeasureHistoryPacket';
import { KeyOpeningHistoryPacket } from './uplink/history/KeyOpeningHistoryPacket';
import { ErrorHistoryPacket } from './uplink/history/ErrorHistoryPacket';
import { NfcOpeningHistoryPacket } from './uplink/history/NfcOpeningHistoryPacket';
import { NfcRegisteringHistoryPacket } from './uplink/history/NfcRegisteringHistoryPacket';

import { calculateChecksum } from '@/utils/converters';
import { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';
import { PACKET_HEADER_SIZE, PACKET_MIN_HEADER_SIZE } from '@/protocol/constants';
import { freeze } from '@/utils/security';

/**
 * List of base RX (Notification) packet classes.
 * These are pre-registered because the client needs them to parse incoming data.
 * Other packets (like TX commands) can be dynamically registered via `BoksPacketFactory.register()`.
 */
const PACKET_CLASSES: BoksPacketConstructor[] = [
  // Scale Notifications
  NotifyScaleBondingSuccessPacket,
  NotifyScaleBondingErrorPacket,
  NotifyMacAddressBoksScalePacket,
  NotifyScaleBondingForgetSuccessPacket,
  NotifyScaleBondingProgressPacket,
  NotifyScaleTareEmptyOkPacket,
  NotifyScaleTareLoadedOkPacket,
  NotifyScaleMeasureWeightPacket,
  NotifyScaleDisconnectedPacket,
  NotifyScaleRawSensorsPacket,
  NotifyScaleFaultyPacket,

  // RX / Notifications
  OperationSuccessPacket,
  OperationErrorPacket,
  NotifyLogsCountPacket,
  ValidOpenCodePacket,
  InvalidOpenCodePacket,
  NotifyDoorStatusPacket,
  AnswerDoorStatusPacket,
  NotifyCodesCountPacket,
  NotifyNfcTagFoundPacket,
  ErrorNfcTagAlreadyExistsScanPacket,
  ErrorNfcScanTimeoutPacket,
  NotifyNfcTagRegisteredPacket,
  NotifyNfcTagRegisteredErrorAlreadyExistsPacket,
  NotifyNfcTagUnregisteredPacket,
  EndHistoryPacket,
  NotifyCodeGenerationSuccessPacket,
  NotifyCodeGenerationErrorPacket,
  NotifyCodeGenerationProgressPacket,
  NotifySetConfigurationSuccessPacket,
  ErrorCrcPacket,
  ErrorUnauthorizedPacket,
  ErrorBadRequestPacket,

  // Logs
  CodeBleValidHistoryPacket,
  CodeBleInvalidHistoryPacket,
  CodeKeyValidHistoryPacket,
  CodeKeyInvalidHistoryPacket,
  DoorOpenHistoryPacket,
  DoorCloseHistoryPacket,
  HistoryEraseHistoryPacket,
  PowerOnHistoryPacket,
  PowerOffHistoryPacket,
  BlockResetHistoryPacket,
  BleRebootHistoryPacket,
  ScaleMeasureHistoryPacket,
  KeyOpeningHistoryPacket,
  ErrorHistoryPacket,
  NfcOpeningHistoryPacket,
  NfcRegisteringHistoryPacket
];

/**
 * Factory class for creating Boks packets from raw data.
 */
@freeze
export class BoksPacketFactory {
  // Optimization: Using a pre-allocated array (size 256 for 1-byte opcodes)
  // instead of a Map provides a ~4x faster O(1) index lookup during high-frequency packet parsing.
  private static readonly registry: (BoksPacketConstructor | undefined)[] = (() => {
    const arr = new Array(256).fill(undefined);
    for (const ctor of PACKET_CLASSES) {
      arr[ctor.opcode] = ctor;
    }
    return arr;
  })();

  /**
   * Register an additional packet dynamically. Useful for Simulator or dynamically injected TX commands.
   */
  static register(ctor: BoksPacketConstructor): void {
    if (ctor && ctor.opcode !== undefined) {
      this.registry[ctor.opcode] = ctor;
    }
  }

  /**
   * Creates a packet instance from a full raw Bluetooth payload.
   * Expected format: [Opcode, Length, ...Payload, Checksum]
   */
  static createFromPayload(
    data: Uint8Array,
    options?: {
      strict?: boolean;
      logger?: (
        level: 'info' | 'warn' | 'error' | 'debug',
        event: 'checksum_error',
        context: { opcode: number; expected: number; received: number }
      ) => void;
    }
  ): BoksPacket {
    if (data.length < PACKET_HEADER_SIZE) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_PAYLOAD_LENGTH,
        `Packet length too short (needs at least ${PACKET_HEADER_SIZE} bytes)`,
        { received: data.length, expected: PACKET_HEADER_SIZE }
      );
    }

    const strict = options?.strict ?? true;
    const logger = options?.logger;

    const opcode = data[0];
    const lengthByte = data[1];
    const Ctor = this.getConstructor(opcode);
    const lengthIncludesHeader = Ctor?.lengthIncludesHeader ?? false;

    // Standard: length byte = payload size. Total = length + 3 (Opcode, Len, CRC)
    // Extended (0xC3): length byte = total size. Total = length
    const expectedTotalLength = lengthIncludesHeader ? lengthByte : lengthByte + PACKET_HEADER_SIZE;

    // Check if we have at least Opcode and Length
    if (data.length < PACKET_MIN_HEADER_SIZE) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_PAYLOAD_LENGTH,
        'Packet too short to even have a header',
        { received: data.length, expected: PACKET_MIN_HEADER_SIZE }
      );
    }

    // Validate checksum only if the buffer is long enough to contain it
    if (data.length >= expectedTotalLength) {
      const checksum = data[expectedTotalLength - 1];
      const computedChecksum = calculateChecksum(data, 0, expectedTotalLength - 1);

      if (checksum !== computedChecksum) {
        if (logger) {
          logger('warn', 'checksum_error', {
            opcode,
            expected: computedChecksum,
            received: checksum
          });
        }

        if (strict) {
          throw new BoksProtocolError(BoksProtocolErrorId.CHECKSUM_MISMATCH, 'Invalid checksum', {
            received: checksum,
            expected: computedChecksum
          });
        }
      }
    } else if (strict) {
      // In strict mode, we require the full packet including checksum
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_PAYLOAD_LENGTH,
        'Packet length too short based on length byte (missing payload or checksum)',
        { received: data.length, expected: expectedTotalLength }
      );
    }

    return this.fromResponse(opcode, data, { strict });
  }

  /**
   * Get the constructor for a specific opcode.
   */
  static getConstructor(opcode: number): BoksPacketConstructor | undefined {
    return this.registry[opcode];
  }

  /**
   * Creates a packet instance from an identified opcode and raw payload.
   */
  static fromResponse(
    opcode: number,
    payload: Uint8Array,
    options?: BoksPacketOptions
  ): BoksPacket {
    const Ctor = this.getConstructor(opcode);
    if (!Ctor) {
      return UnknownPacket.fromUnknownPayload(opcode, payload);
    }

    return Ctor.fromRaw(payload, options);
  }
}
