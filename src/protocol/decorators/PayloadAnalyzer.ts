import { CHAR_CODES } from '../constants';
import { BoksProtocolError, BoksProtocolErrorId } from '../../errors/BoksProtocolError';
import { BoksExpectedReason } from '../../errors/BoksExpectedReason';
import { bytesToHex, hexToBytes, readPinFromBuffer } from '../../utils/converters';

function isHexChar(c: number): boolean {
  return (
    (c >= CHAR_CODES['0'] && c <= CHAR_CODES['9']) ||
    (c >= CHAR_CODES['A'] && c <= CHAR_CODES['F']) ||
    (c >= CHAR_CODES['a'] && c <= CHAR_CODES['f'])
  );
}

function isStdPinChar(c: number): boolean {
  return (
    (c >= CHAR_CODES['0'] && c <= CHAR_CODES['9']) || c === CHAR_CODES['A'] || c === CHAR_CODES['B']
  );
}

export class PayloadAnalyzer {
  // --- PARSING METHODS ---

  public readUint8(payload: Uint8Array, offset: number): number {
    return payload[offset];
  }

  public readUint16(payload: Uint8Array, offset: number): number {
    return (payload[offset] << 8) | payload[offset + 1];
  }

  public readUint24(payload: Uint8Array, offset: number): number {
    return (payload[offset] << 16) | (payload[offset + 1] << 8) | payload[offset + 2];
  }

  public readUint32(payload: Uint8Array, offset: number): number {
    return (
      ((payload[offset] << 24) |
        (payload[offset + 1] << 16) |
        (payload[offset + 2] << 8) |
        payload[offset + 3]) >>>
      0
    );
  }

  public readAsciiString(payload: Uint8Array, offset: number, length: number): string {
    let s = '';
    for (let i = 0; i < length; i++) {
      const c = payload[offset + i];
      if (c) {
        s += String.fromCharCode(c);
      }
    }
    return s;
  }

  public readBoolean(payload: Uint8Array, offset: number, prop: string): boolean {
    if (payload[offset] !== 0x00 && payload[offset] !== 0x01) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_VALUE,
        'Boolean field must be 0x00 or 0x01',
        { field: prop, received: payload[offset], expected: BoksExpectedReason.UINT8 }
      );
    }
    return payload[offset] === 0x01;
  }

  public readByteArray(payload: Uint8Array, offset: number, length?: number): Uint8Array {
    if (typeof length === 'number') {
      return payload.slice(offset, offset + length);
    }
    return payload.slice(offset);
  }

  public readMacAddress(payload: Uint8Array, offset: number): string {
    return bytesToHex(payload, { reverse: true, start: offset, end: offset + 6 });
  }

  public readPinCode(
    payload: Uint8Array,
    offset: number,
    prop: string,
    allowIds: boolean = false
  ): string {
    const s = readPinFromBuffer(payload, offset);
    const isId =
      allowIds &&
      s.length >= 2 &&
      (s.charCodeAt(0) === CHAR_CODES['M'] || s.charCodeAt(0) === CHAR_CODES['U']) &&
      s.charCodeAt(1) === CHAR_CODES['C'];

    for (let i = 0; i < 6; i++) {
      const c = s.charCodeAt(i);
      if (isStdPinChar(c)) {
        continue;
      }

      if (isId) {
        if (i === 0 && (c === CHAR_CODES['M'] || c === CHAR_CODES['U'])) {
          continue;
        }
        if (i === 1 && c === CHAR_CODES['C']) {
          continue;
        }
      }

      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_PIN_FORMAT,
        'Invalid PIN character inline',
        { field: prop, received: s, expected: BoksExpectedReason.VALID_HEX_CHAR }
      );
    }
    return s;
  }

  public readConfigKey(payload: Uint8Array, offset: number, prop: string): string {
    for (let i = 0; i < 8; i++) {
      const c = payload[offset + i];
      if (!isHexChar(c)) {
        throw new BoksProtocolError(
          BoksProtocolErrorId.INVALID_CONFIG_KEY,
          'Invalid Config Key character inline',
          { field: prop, received: c, expected: BoksExpectedReason.VALID_HEX_CHAR }
        );
      }
    }
    return String.fromCharCode(
      payload[offset],
      payload[offset + 1],
      payload[offset + 2],
      payload[offset + 3],
      payload[offset + 4],
      payload[offset + 5],
      payload[offset + 6],
      payload[offset + 7]
    ).toUpperCase();
  }

  public readHexString(payload: Uint8Array, offset: number, length?: number): string {
    if (typeof length === 'number') {
      return bytesToHex(payload, { start: offset, end: offset + length });
    }
    return bytesToHex(payload, { start: offset });
  }

  public readVarLenHex(payload: Uint8Array, offset: number, prop: string): string {
    const len = payload[offset];
    if (payload.length < offset + 1 + len) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.MALFORMED_DATA,
        'Payload too short for variable length hex string',
        { field: prop, received: payload.length, expected: offset + 1 + len }
      );
    }
    return bytesToHex(payload, { start: offset + 1, end: offset + 1 + len });
  }

  public readBit(payload: Uint8Array, offset: number, bitIndex: number): boolean {
    return ((payload[offset] >> bitIndex) & 1) === 1;
  }

  // --- VALIDATION METHODS ---

  public validatePinCode(val: unknown, prop: string, allowIds: boolean = false): void {
    if (typeof val !== 'string' || val.length !== 6) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_PIN_FORMAT,
        'PIN code must be exactly 6 characters',
        { field: prop, received: typeof val === 'string' ? val.length : typeof val, expected: 6 }
      );
    }
    const isId =
      allowIds &&
      val.length >= 2 &&
      (val.charCodeAt(0) === CHAR_CODES['M'] || val.charCodeAt(0) === CHAR_CODES['U']) &&
      val.charCodeAt(1) === CHAR_CODES['C'];
    for (let i = 0; i < 6; i++) {
      const c = val.charCodeAt(i);
      if (isStdPinChar(c)) {
        continue;
      }

      if (isId) {
        if (i === 0 && (c === CHAR_CODES['M'] || c === CHAR_CODES['U'])) {
          continue;
        }
        if (i === 1 && c === CHAR_CODES['C']) {
          continue;
        }
      }

      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_PIN_FORMAT,
        'Invalid PIN character inline',
        { field: prop, received: val, expected: BoksExpectedReason.VALID_HEX_CHAR }
      );
    }
  }

  public validateConfigKey(val: unknown, prop: string): void {
    if (typeof val !== 'string' || val.length !== 8) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_CONFIG_KEY,
        'Config Key must be exactly 8 characters',
        { field: prop, received: typeof val === 'string' ? val.length : typeof val, expected: 8 }
      );
    }
    for (let i = 0; i < 8; i++) {
      const c = val.charCodeAt(i);
      if (!isHexChar(c)) {
        throw new BoksProtocolError(
          BoksProtocolErrorId.INVALID_CONFIG_KEY,
          'Config Key must contain only hex characters',
          { field: prop, received: val, expected: BoksExpectedReason.VALID_HEX_CHAR }
        );
      }
    }
  }

  // --- SERIALIZATION METHODS ---

  public writeUint8(payload: Uint8Array, offset: number, val: number): void {
    payload[offset] = val;
  }

  public writeUint16(payload: Uint8Array, offset: number, val: number): void {
    payload[offset] = (val >> 8) & 255;
    payload[offset + 1] = val & 255;
  }

  public writeUint24(payload: Uint8Array, offset: number, val: number): void {
    payload[offset] = (val >> 16) & 255;
    payload[offset + 1] = (val >> 8) & 255;
    payload[offset + 2] = val & 255;
  }

  public writeUint32(payload: Uint8Array, offset: number, val: number): void {
    payload[offset] = (val >>> 24) & 255;
    payload[offset + 1] = (val >>> 16) & 255;
    payload[offset + 2] = (val >>> 8) & 255;
    payload[offset + 3] = val & 255;
  }

  public writeAsciiString(
    payload: Uint8Array,
    offset: number,
    strVal: string,
    length: number
  ): void {
    for (let i = 0; i < length; i++) {
      payload[offset + i] = strVal.length > i ? strVal.charCodeAt(i) : 0;
    }
  }

  public writeBoolean(payload: Uint8Array, offset: number, val: boolean): void {
    payload[offset] = val ? 0x01 : 0x00;
  }

  public writeByteArray(payload: Uint8Array, offset: number, src: unknown, length?: number): void {
    if (src instanceof Uint8Array) {
      if (typeof length === 'number') {
        const len = Math.min(src.length, length);
        for (let i = 0; i < len; i++) {
          payload[offset + i] = src[i];
        }
      } else {
        for (let i = 0; i < src.length; i++) {
          payload[offset + i] = src[i];
        }
      }
    }
  }

  public writeMacAddress(payload: Uint8Array, offset: number, macVal: unknown): void {
    if (typeof macVal === 'string') {
      const bytes = hexToBytes(macVal);
      if (bytes.length === 6) {
        payload[offset] = bytes[5];
        payload[offset + 1] = bytes[4];
        payload[offset + 2] = bytes[3];
        payload[offset + 3] = bytes[2];
        payload[offset + 4] = bytes[1];
        payload[offset + 5] = bytes[0];
      }
    }
  }

  public writePinCode(payload: Uint8Array, offset: number, strVal: string): void {
    for (let i = 0; i < 6; i++) {
      payload[offset + i] = strVal.charCodeAt(i);
    }
  }

  public writeConfigKey(payload: Uint8Array, offset: number, strVal: string): void {
    for (let i = 0; i < 8; i++) {
      payload[offset + i] = strVal.charCodeAt(i);
    }
  }

  public writeHexString(
    payload: Uint8Array,
    offset: number,
    hexVal: unknown,
    length?: number
  ): void {
    if (typeof length === 'number') {
      if (typeof hexVal === 'string') {
        const bytes = hexToBytes(hexVal);
        for (let i = 0; i < length && i < bytes.length; i++) {
          payload[offset + i] = bytes[i];
        }
      } else if (hexVal instanceof Uint8Array) {
        const len = Math.min(hexVal.length, length);
        for (let i = 0; i < len; i++) {
          payload[offset + i] = hexVal[i];
        }
      }
    } else {
      if (typeof hexVal === 'string') {
        const bytes = hexToBytes(hexVal);
        payload.set(bytes, offset);
      } else if (hexVal instanceof Uint8Array) {
        payload.set(hexVal, offset);
      }
    }
  }

  public writeVarLenHex(payload: Uint8Array, offset: number, hexVal: unknown): void {
    if (typeof hexVal === 'string') {
      const bytes = hexToBytes(hexVal);
      payload[offset] = bytes.length;
      payload.set(bytes, offset + 1);
    } else {
      payload[offset] = 0;
    }
  }

  public writeBit(payload: Uint8Array, offset: number, bitIndex: number, val: boolean): void {
    if (val) {
      payload[offset] |= 1 << bitIndex;
    } else {
      payload[offset] &= ~(1 << bitIndex);
    }
  }
}
