import { getOrCreateMetadata } from './PayloadMapper';
import { assertSafeBounds } from './PayloadMetadata';
import { BoksProtocolError, BoksProtocolErrorId } from '../../errors/BoksProtocolError';
import { BoksExpectedReason } from '../../errors/BoksExpectedReason';

export function PayloadBit(offset: number, bitIndex: number) {
  assertSafeBounds(offset, 1);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    if (bitIndex < 0 || bitIndex > 7) {
      throw new Error(`Invalid bitIndex ${bitIndex} for property ${context.name as string}`);
    }
    meta.push({ propertyName: context.name as string, type: 'bit', offset, bitIndex });

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
