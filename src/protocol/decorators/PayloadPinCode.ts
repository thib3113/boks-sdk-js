import { PayloadMapper, getOrCreateMetadata } from './PayloadMapper';
import { BoksProtocolError, BoksProtocolErrorId } from '../../errors/BoksProtocolError';
import { BoksExpectedReason } from '../../errors/BoksExpectedReason';

export function PayloadPinCode(offset: number) {
  PayloadMapper.assertSafeBounds(offset, 6);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'pin_code', offset, length: 6 });

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
        if (formatted.length !== 6) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.INVALID_PIN_FORMAT,
            'PIN must be exactly 6 characters',
            { field: context.name as string, received: formatted.length, expected: 6 }
          );
        }
        for (let i = 0; i < 6; i++) {
          const c = formatted.charCodeAt(i);
          if ((c < 48 || c > 57) && c !== 65 && c !== 66 && c !== 97 && c !== 98) {
            throw new BoksProtocolError(
              BoksProtocolErrorId.INVALID_PIN_FORMAT,
              'PIN must contain only 0-9, A, B',
              {
                field: context.name as string,
                received: formatted,
                expected: BoksExpectedReason.PIN_CODE_FORMAT
              }
            );
          }
        }
        target.set.call(this, formatted as V);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}
