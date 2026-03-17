/* eslint-disable @typescript-eslint/no-explicit-any */
import { BoksProtocolError, BoksProtocolErrorId } from '../../errors/BoksProtocolError';

export const METADATA_KEY = Symbol.for('BoksPayloadMapper');
export const MAX_PAYLOAD_SIZE = 1024;

export type FieldType =
  | 'uint8'
  | 'uint16'
  | 'uint24'
  | 'uint32'
  | 'ascii_string'
  | 'mac_address'
  | 'hex_string'
  | 'pin_code'
  | 'config_key'
  | 'boolean'
  | 'byte_array'
  | 'var_len_hex'
  | 'bit';

export interface FieldDefinition {
  propertyName: string;
  type: FieldType;
  offset: number;
  length?: number;
  bitIndex?: number;
}

export type PayloadConstructor = abstract new (...args: any[]) => any;

export const legacyMetadataMap = new WeakMap<PayloadConstructor, FieldDefinition[]>();

export function assertSafeBounds(offset: number, size: number): void {
  if (
    typeof offset !== 'number' ||
    Number.isNaN(offset) ||
    typeof size !== 'number' ||
    Number.isNaN(size) ||
    offset < 0 ||
    size < 0 ||
    offset + size > MAX_PAYLOAD_SIZE
  ) {
    throw new BoksProtocolError(
      BoksProtocolErrorId.BUFFER_OVERFLOW,
      `Invalid mapping bounds: offset=${offset}, size=${size}`,
      {
        received: offset + size,
        expected: MAX_PAYLOAD_SIZE
      }
    );
  }
}
