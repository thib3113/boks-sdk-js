import { getOrCreateMetadata } from './PayloadMapper';
import { assertSafeBounds } from './PayloadMetadata';
import { BoksProtocolError, BoksProtocolErrorId } from '../../errors/BoksProtocolError';
import { BoksExpectedReason } from '../../errors/BoksExpectedReason';

export function PayloadMacAddress(offset: number) {
  assertSafeBounds(offset, 6);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'mac_address', offset, length: 6 });

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
        target.set.call(this, val);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}
