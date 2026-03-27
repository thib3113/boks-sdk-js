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
  private throwInvalidPin(prop: string, received: unknown): never {
    throw new BoksProtocolError(
      BoksProtocolErrorId.INVALID_PIN_FORMAT,
      'Invalid PIN character inline',
      { field: prop, received, expected: BoksExpectedReason.VALID_HEX_CHAR }
    );
  }

  private throwInvalidConfigKey(prop: string, received: unknown): never {
    throw new BoksProtocolError(
      BoksProtocolErrorId.INVALID_CONFIG_KEY,
      'Invalid Config Key character inline',
      { field: prop, received, expected: BoksExpectedReason.VALID_HEX_CHAR }
    );
  }

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
    if (length === 0) {
      return '';
    }
    // Optimized for small/medium strings (V8 max arguments limit is around ~120k)
    // We slice the exact length, ignoring trailing nulls if present depending on how it's written.
    // The previous implementation ignored 0x00 bytes. We need to preserve that behavior.
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
    if (!isHexChar(payload[offset])) {
      this.throwInvalidConfigKey(prop, payload[offset]);
    }
    if (!isHexChar(payload[offset + 1])) {
      this.throwInvalidConfigKey(prop, payload[offset + 1]);
    }
    if (!isHexChar(payload[offset + 2])) {
      this.throwInvalidConfigKey(prop, payload[offset + 2]);
    }
    if (!isHexChar(payload[offset + 3])) {
      this.throwInvalidConfigKey(prop, payload[offset + 3]);
    }
    if (!isHexChar(payload[offset + 4])) {
      this.throwInvalidConfigKey(prop, payload[offset + 4]);
    }
    if (!isHexChar(payload[offset + 5])) {
      this.throwInvalidConfigKey(prop, payload[offset + 5]);
    }
    if (!isHexChar(payload[offset + 6])) {
      this.throwInvalidConfigKey(prop, payload[offset + 6]);
    }
    if (!isHexChar(payload[offset + 7])) {
      this.throwInvalidConfigKey(prop, payload[offset + 7]);
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

    const c0 = val.charCodeAt(0);
    const c1 = val.charCodeAt(1);
    const isId =
      allowIds && (c0 === CHAR_CODES['M'] || c0 === CHAR_CODES['U']) && c1 === CHAR_CODES['C'];

    if (!isStdPinChar(c0) && !(isId && (c0 === CHAR_CODES['M'] || c0 === CHAR_CODES['U']))) {
      this.throwInvalidPin(prop, val);
    }
    if (!isStdPinChar(c1) && !(isId && c1 === CHAR_CODES['C'])) {
      this.throwInvalidPin(prop, val);
    }
    if (!isStdPinChar(val.charCodeAt(2))) {
      this.throwInvalidPin(prop, val);
    }
    if (!isStdPinChar(val.charCodeAt(3))) {
      this.throwInvalidPin(prop, val);
    }
    if (!isStdPinChar(val.charCodeAt(4))) {
      this.throwInvalidPin(prop, val);
    }
    if (!isStdPinChar(val.charCodeAt(5))) {
      this.throwInvalidPin(prop, val);
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
    if (!isHexChar(val.charCodeAt(0))) {
      this.throwInvalidConfigKey(prop, val);
    }
    if (!isHexChar(val.charCodeAt(1))) {
      this.throwInvalidConfigKey(prop, val);
    }
    if (!isHexChar(val.charCodeAt(2))) {
      this.throwInvalidConfigKey(prop, val);
    }
    if (!isHexChar(val.charCodeAt(3))) {
      this.throwInvalidConfigKey(prop, val);
    }
    if (!isHexChar(val.charCodeAt(4))) {
      this.throwInvalidConfigKey(prop, val);
    }
    if (!isHexChar(val.charCodeAt(5))) {
      this.throwInvalidConfigKey(prop, val);
    }
    if (!isHexChar(val.charCodeAt(6))) {
      this.throwInvalidConfigKey(prop, val);
    }
    if (!isHexChar(val.charCodeAt(7))) {
      this.throwInvalidConfigKey(prop, val);
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
    payload[offset] = strVal.charCodeAt(0);
    payload[offset + 1] = strVal.charCodeAt(1);
    payload[offset + 2] = strVal.charCodeAt(2);
    payload[offset + 3] = strVal.charCodeAt(3);
    payload[offset + 4] = strVal.charCodeAt(4);
    payload[offset + 5] = strVal.charCodeAt(5);
  }

  public writeConfigKey(payload: Uint8Array, offset: number, strVal: string): void {
    payload[offset] = strVal.charCodeAt(0);
    payload[offset + 1] = strVal.charCodeAt(1);
    payload[offset + 2] = strVal.charCodeAt(2);
    payload[offset + 3] = strVal.charCodeAt(3);
    payload[offset + 4] = strVal.charCodeAt(4);
    payload[offset + 5] = strVal.charCodeAt(5);
    payload[offset + 6] = strVal.charCodeAt(6);
    payload[offset + 7] = strVal.charCodeAt(7);
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
