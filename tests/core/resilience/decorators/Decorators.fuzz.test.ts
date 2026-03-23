import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { PayloadMapper } from '../../../../src/protocol/decorators/PayloadMapper';
import {
  PayloadUint8,
  PayloadUint16,
  PayloadUint24,
  PayloadUint32,
  PayloadAsciiString,
  PayloadMacAddress,
  PayloadHexString,
  PayloadPinCode,
  PayloadConfigKey,
  PayloadBoolean,
  PayloadByteArray,
  PayloadBit,
  PayloadNfcUid,
  PayloadSeed,
  PayloadMasterCodeIndex,
  PayloadVarLenHex
} from '../../../../src/protocol/decorators/index';
import { BoksProtocolError } from '../../../../src/errors/BoksProtocolError';

class FuzzTestPacketAll {
  @PayloadUint8(0) public accessor uint8Val!: number;
  @PayloadUint16(1) public accessor uint16Val!: number;
  @PayloadUint24(3) public accessor uint24Val!: number;
  @PayloadUint32(6) public accessor uint32Val!: number;
  @PayloadAsciiString(10, 5) public accessor asciiVal!: string;
  @PayloadMacAddress(15) public accessor macVal!: string;
  @PayloadHexString(21, 4) public accessor hexVal!: string;
  @PayloadPinCode(25) public accessor pinVal!: string;
  @PayloadConfigKey(31) public accessor configVal!: string;
  @PayloadBoolean(39) public accessor boolVal!: boolean;
  @PayloadByteArray(40, 4) public accessor byteArrVal!: Uint8Array;
  @PayloadBit(44, 0) public accessor bitVal0!: boolean;
  @PayloadBit(44, 7) public accessor bitVal7!: boolean;
  @PayloadNfcUid(45) public accessor nfcUidVal!: string;
  @PayloadSeed(49) public accessor seedVal!: string;
  @PayloadMasterCodeIndex(53) public accessor masterCodeIdxVal!: number;
  @PayloadVarLenHex(54) public accessor varLenHexVal!: string;

  constructor(data: Partial<FuzzTestPacketAll>) {
    Object.assign(this, data);
  }
}

describe('All Decorators Resilience (Fuzzing)', () => {
  it('FEATURE REGRESSION: should safely parse completely arbitrary payloads without crashing for complex packet', () => {
    fc.assert(
      fc.property(fc.uint8Array({ minLength: 0, maxLength: 256 }), (payload) => {
        try {
          PayloadMapper.parse(FuzzTestPacketAll, payload);
        } catch (e: any) {
          expect(e).toBeInstanceOf(BoksProtocolError);
        }
      }),
      { numRuns: 1000 }
    );
  });
});
