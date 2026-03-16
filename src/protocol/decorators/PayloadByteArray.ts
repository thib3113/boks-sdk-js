import { PayloadMapper, getOrCreateMetadata } from './PayloadMapper';
import { BoksProtocolError, BoksProtocolErrorId } from '../../errors/BoksProtocolError';
import { BoksExpectedReason } from '../../errors/BoksExpectedReason';

export function PayloadByteArray(offset: number, length?: number) {
  PayloadMapper.assertSafeBounds(offset, length || 0);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'byte_array', offset, length });

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

        if (length !== undefined && (val as unknown as Uint8Array).length !== length) {
          throw new BoksProtocolError(
            BoksProtocolErrorId.INVALID_PAYLOAD_LENGTH,
            `Array length must be exactly ${length}`,
            {
              field: context.name as string,
              received: (val as unknown as Uint8Array).length,
              expected: length
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
