import { PayloadMapper, getOrCreateMetadata } from './PayloadMapper';
import { BoksProtocolError, BoksProtocolErrorId } from '../../errors/BoksProtocolError';
import { BoksExpectedReason } from '../../errors/BoksExpectedReason';

export function PayloadConfigKey(offset: number) {
  PayloadMapper.assertSafeBounds(offset, 8);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'config_key', offset, length: 8 });

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
        if (formatted.length !== 8) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.INVALID_CONFIG_KEY,
            'Config Key must be exactly 8 characters',
            { field: context.name as string, received: formatted.length, expected: 8 }
          );
        }
        for (let i = 0; i < 8; i++) {
          const c = formatted.charCodeAt(i);
          if ((c < 48 || c > 57) && (c < 65 || c > 70) && (c < 97 || c > 102)) {
            throw new BoksProtocolError(
              BoksProtocolErrorId.INVALID_CONFIG_KEY,
              'Config Key must contain only hex characters',
              {
                field: context.name as string,
                received: formatted,
                expected: BoksExpectedReason.VALID_HEX_CHAR
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
