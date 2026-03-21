import { getOrCreateMetadata } from './PayloadMapper';
import { assertSafeBounds } from './PayloadMetadata';
import { BoksProtocolError, BoksProtocolErrorId } from '../../errors/BoksProtocolError';
import { BoksExpectedReason } from '../../errors/BoksExpectedReason';

import { bytesToHex } from '@/utils/converters';
import { isHexCode } from '@/utils/validation';

export function PayloadHexString(offset: number, length?: number) {
  assertSafeBounds(offset, length || 0);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'hex_string', offset, length });

    return {
      get() {
        return target.get.call(this);
      },
      set(val: V) {
        if (val === undefined || val === null) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.MISSING_MANDATORY_FIELD,
            'Required field cannot be undefined',
            {
              field: context.name as string,
              received: val,
              expected: BoksExpectedReason.EXACT_LENGTH
            }
          );
        }

        let strVal: string;
        if (val instanceof Uint8Array) {
          strVal = bytesToHex(val).toUpperCase();
        } else if (typeof val === 'string') {
          strVal = val.toUpperCase();
        } else {
          throw new BoksProtocolError(
            BoksProtocolErrorId.INVALID_TYPE,
            `${context.name as string} must be a string or Uint8Array`,
            {
              field: context.name as string,
              received: typeof val,
              expected: 'string | Uint8Array'
            }
          );
        }

        if (length !== undefined && strVal.length !== length * 2) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.INVALID_PAYLOAD_LENGTH,
            `Hex string length must be exactly ${length * 2} characters`,
            {
              field: context.name as string,
              received: strVal.length,
              expected: length * 2
            }
          );
        }

        for (let i = 0; i < strVal.length; i++) {
          if (!isHexCode(strVal.charCodeAt(i))) {
            throw new BoksProtocolError(
              BoksProtocolErrorId.INVALID_VALUE,
              `${context.name as string} must contain only valid hex characters`,
              {
                field: context.name as string,
                received: strVal,
                expected: BoksExpectedReason.VALID_HEX_CHAR
              }
            );
          }
        }

        target.set.call(this, strVal as unknown as V);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}
