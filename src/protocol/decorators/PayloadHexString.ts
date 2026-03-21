import { getOrCreateMetadata } from './PayloadMapper';
import { assertSafeBounds } from './PayloadMetadata';
import { BoksProtocolError, BoksProtocolErrorId } from '../../errors/BoksProtocolError';
import { BoksExpectedReason } from '../../errors/BoksExpectedReason';
import { bytesToHex } from '@/utils/converters';

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

        let strVal = val as unknown as string;
        if (val instanceof Uint8Array) {
          strVal = bytesToHex(val).toLowerCase();
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
        target.set.call(this, strVal as unknown as V);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}
