import { getOrCreateMetadata } from './PayloadMapper';
import { assertSafeBounds } from './PayloadMetadata';
import { BoksProtocolError, BoksProtocolErrorId } from '../../errors/BoksProtocolError';
import { BoksExpectedReason } from '../../errors/BoksExpectedReason';
import { validatePinCode } from '../../utils/validation';

export interface PayloadPinCodeOptions {
  allowIds?: boolean;
}

export function PayloadPinCode(offset: number, options: PayloadPinCodeOptions = {}) {
  assertSafeBounds(offset, 6);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({
      propertyName: context.name as string,
      type: 'pin_code',
      offset,
      length: 6,
      allowIds: options.allowIds
    });

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
        const formatted = typeof val === 'string' ? val.toUpperCase() : String(val).toUpperCase();
        validatePinCode(formatted, options.allowIds);
        target.set.call(this, formatted as V);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}
