import { validateNfcUid } from '../../utils/validation';
import { getOrCreateMetadata } from './PayloadMapper';
import { assertSafeBounds } from './PayloadMetadata';
import { BoksProtocolError, BoksProtocolErrorId } from '../../errors/BoksProtocolError';
import { BoksExpectedReason } from '../../errors/BoksExpectedReason';

export function PayloadNfcUid(offset: number) {
  assertSafeBounds(offset, 1);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    // Uses var_len_hex because NFC UID is variable length hex in the payload
    meta.push({ propertyName: context.name as string, type: 'var_len_hex', offset });

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
        const strVal = String(val);
        validateNfcUid(strVal);
        const { bytesToHex, hexToBytes } = require('../../utils/converters');
        const formatted = bytesToHex(hexToBytes(strVal));
        target.set.call(this, formatted as V);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}
