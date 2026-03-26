import { getOrCreateMetadata } from './PayloadMapper';
import { assertSafeBounds } from './PayloadMetadata';
import { BoksProtocolError, BoksProtocolErrorId } from '../../errors/BoksProtocolError';
import { BoksExpectedReason } from '../../errors/BoksExpectedReason';

export function PayloadProgress(offset: number) {
  assertSafeBounds(offset, 1);
  return function <T, V extends number>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    // Re-use 'uint8' type because it essentially is a Uint8, we just add extra validation.
    meta.push({ propertyName: context.name as string, type: 'uint8', offset });

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

        if (val < 0 || val > 100) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.INVALID_VALUE,
            'Progress value must be between 0 and 100',
            { progress: val }
          );
        }

        target.set.call(this, val);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}
