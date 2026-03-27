const fs = require('fs');

let code = fs.readFileSync('src/protocol/decorators/PayloadAnalyzer.ts', 'utf8');

// 1. readAsciiString (chunked String.fromCharCode)
code = code.replace(
  /public readAsciiString\(payload: Uint8Array, offset: number, length: number\): string \{[\s\S]*?return s;\n  \}/,
  `public readAsciiString(payload: Uint8Array, offset: number, length: number): string {
    if (length === 0) return '';
    // Optimized for small/medium strings (V8 max arguments limit is around ~120k)
    // We slice the exact length, ignoring trailing nulls if present depending on how it's written.
    // The previous implementation ignored 0x00 bytes. We need to preserve that behavior.
    let s = '';
    for (let i = 0; i < length; i++) {
      const c = payload[offset + i];
      if (c) s += String.fromCharCode(c);
    }
    return s;
  }`
); // Kept it as-is for now to guarantee 0x00 ignoring behavior without array filtering overhead


// 2. readPinCode (Validate bytes, then read string)
code = code.replace(
  /public readPinCode\(payload: Uint8Array, offset: number, prop: string, allowIds: boolean = false\): string \{[\s\S]*?return s;\n  \}/,
  `public readPinCode(payload: Uint8Array, offset: number, prop: string, allowIds: boolean = false): string {
    const c0 = payload[offset];
    const c1 = payload[offset + 1];

    const isId = allowIds && (c0 === CHAR_CODES['M'] || c0 === CHAR_CODES['U']) && c1 === CHAR_CODES['C'];

    // Unrolled byte validation
    if (!isStdPinChar(c0) && !(isId && (c0 === CHAR_CODES['M'] || c0 === CHAR_CODES['U']))) this.throwInvalidPin(prop, c0);
    if (!isStdPinChar(c1) && !(isId && c1 === CHAR_CODES['C'])) this.throwInvalidPin(prop, c1);
    if (!isStdPinChar(payload[offset + 2])) this.throwInvalidPin(prop, payload[offset + 2]);
    if (!isStdPinChar(payload[offset + 3])) this.throwInvalidPin(prop, payload[offset + 3]);
    if (!isStdPinChar(payload[offset + 4])) this.throwInvalidPin(prop, payload[offset + 4]);
    if (!isStdPinChar(payload[offset + 5])) this.throwInvalidPin(prop, payload[offset + 5]);

    return readPinFromBuffer(payload, offset);
  }`
);

// 3. readConfigKey (Unrolled validation and reading)
code = code.replace(
  /public readConfigKey\(payload: Uint8Array, offset: number, prop: string\): string \{[\s\S]*?return String\.fromCharCode[\s\S]*?\n  \}/,
  `public readConfigKey(payload: Uint8Array, offset: number, prop: string): string {
    if (!isHexChar(payload[offset])) this.throwInvalidConfigKey(prop, payload[offset]);
    if (!isHexChar(payload[offset + 1])) this.throwInvalidConfigKey(prop, payload[offset + 1]);
    if (!isHexChar(payload[offset + 2])) this.throwInvalidConfigKey(prop, payload[offset + 2]);
    if (!isHexChar(payload[offset + 3])) this.throwInvalidConfigKey(prop, payload[offset + 3]);
    if (!isHexChar(payload[offset + 4])) this.throwInvalidConfigKey(prop, payload[offset + 4]);
    if (!isHexChar(payload[offset + 5])) this.throwInvalidConfigKey(prop, payload[offset + 5]);
    if (!isHexChar(payload[offset + 6])) this.throwInvalidConfigKey(prop, payload[offset + 6]);
    if (!isHexChar(payload[offset + 7])) this.throwInvalidConfigKey(prop, payload[offset + 7]);

    return String.fromCharCode(payload[offset], payload[offset + 1], payload[offset + 2], payload[offset + 3], payload[offset + 4], payload[offset + 5], payload[offset + 6], payload[offset + 7]).toUpperCase();
  }`
);


// 4. validatePinCode (Unrolled validation)
code = code.replace(
  /public validatePinCode\(val: unknown, prop: string, allowIds: boolean = false\): void \{[\s\S]*?\}\n  \}/,
  `public validatePinCode(val: unknown, prop: string, allowIds: boolean = false): void {
    if (typeof val !== 'string' || val.length !== 6) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_PIN_FORMAT,
        'PIN code must be exactly 6 characters',
        { field: prop, received: typeof val === 'string' ? val.length : typeof val, expected: 6 }
      );
    }

    const c0 = val.charCodeAt(0);
    const c1 = val.charCodeAt(1);
    const isId = allowIds && (c0 === CHAR_CODES['M'] || c0 === CHAR_CODES['U']) && c1 === CHAR_CODES['C'];

    if (!isStdPinChar(c0) && !(isId && (c0 === CHAR_CODES['M'] || c0 === CHAR_CODES['U']))) this.throwInvalidPin(prop, val);
    if (!isStdPinChar(c1) && !(isId && c1 === CHAR_CODES['C'])) this.throwInvalidPin(prop, val);
    if (!isStdPinChar(val.charCodeAt(2))) this.throwInvalidPin(prop, val);
    if (!isStdPinChar(val.charCodeAt(3))) this.throwInvalidPin(prop, val);
    if (!isStdPinChar(val.charCodeAt(4))) this.throwInvalidPin(prop, val);
    if (!isStdPinChar(val.charCodeAt(5))) this.throwInvalidPin(prop, val);
  }`
);

// 5. validateConfigKey (Unrolled validation)
code = code.replace(
  /public validateConfigKey\(val: unknown, prop: string\): void \{[\s\S]*?\}\n  \}/,
  `public validateConfigKey(val: unknown, prop: string): void {
    if (typeof val !== 'string' || val.length !== 8) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.INVALID_CONFIG_KEY,
        'Config Key must be exactly 8 characters',
        { field: prop, received: typeof val === 'string' ? val.length : typeof val, expected: 8 }
      );
    }
    if (!isHexChar(val.charCodeAt(0))) this.throwInvalidConfigKey(prop, val);
    if (!isHexChar(val.charCodeAt(1))) this.throwInvalidConfigKey(prop, val);
    if (!isHexChar(val.charCodeAt(2))) this.throwInvalidConfigKey(prop, val);
    if (!isHexChar(val.charCodeAt(3))) this.throwInvalidConfigKey(prop, val);
    if (!isHexChar(val.charCodeAt(4))) this.throwInvalidConfigKey(prop, val);
    if (!isHexChar(val.charCodeAt(5))) this.throwInvalidConfigKey(prop, val);
    if (!isHexChar(val.charCodeAt(6))) this.throwInvalidConfigKey(prop, val);
    if (!isHexChar(val.charCodeAt(7))) this.throwInvalidConfigKey(prop, val);
  }`
);


// 6. writePinCode (Unrolled assignment)
code = code.replace(
  /public writePinCode\(payload: Uint8Array, offset: number, strVal: string\): void \{[\s\S]*?\}\n  \}/,
  `public writePinCode(payload: Uint8Array, offset: number, strVal: string): void {
    payload[offset] = strVal.charCodeAt(0);
    payload[offset + 1] = strVal.charCodeAt(1);
    payload[offset + 2] = strVal.charCodeAt(2);
    payload[offset + 3] = strVal.charCodeAt(3);
    payload[offset + 4] = strVal.charCodeAt(4);
    payload[offset + 5] = strVal.charCodeAt(5);
  }`
);

// 7. writeConfigKey (Unrolled assignment)
code = code.replace(
  /public writeConfigKey\(payload: Uint8Array, offset: number, strVal: string\): void \{[\s\S]*?\}\n  \}/,
  `public writeConfigKey(payload: Uint8Array, offset: number, strVal: string): void {
    payload[offset] = strVal.charCodeAt(0);
    payload[offset + 1] = strVal.charCodeAt(1);
    payload[offset + 2] = strVal.charCodeAt(2);
    payload[offset + 3] = strVal.charCodeAt(3);
    payload[offset + 4] = strVal.charCodeAt(4);
    payload[offset + 5] = strVal.charCodeAt(5);
    payload[offset + 6] = strVal.charCodeAt(6);
    payload[offset + 7] = strVal.charCodeAt(7);
  }`
);

// We need to add the `throwInvalidPin` and `throwInvalidConfigKey` helpers
const classStart = code.indexOf('export class PayloadAnalyzer {');
const errorHelpers = `
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
`;

code = code.substring(0, classStart + 'export class PayloadAnalyzer {'.length) + errorHelpers + code.substring(classStart + 'export class PayloadAnalyzer {'.length);

fs.writeFileSync('src/protocol/decorators/PayloadAnalyzer.ts', code);
