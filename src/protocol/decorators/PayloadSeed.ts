import { validateSeed } from '../../utils/validation';
import { bytesToHex } from '../../utils/converters';
import { PayloadMapper, getOrCreateMetadata } from './PayloadMapper';
import { BoksProtocolError, BoksProtocolErrorId } from '../../errors/BoksProtocolError';
import { BoksExpectedReason } from '../../errors/BoksExpectedReason';

export function PayloadSeed(offset: number) {
  PayloadMapper.assertSafeBounds(offset, 32);
  return function <T, V>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> {
    const meta = getOrCreateMetadata(context);
    meta.push({ propertyName: context.name as string, type: 'hex_string', offset, length: 32 });

    return {
      get() {
        return target.get.call(this);
      },
      set(val: V | Uint8Array | any) {
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

        let formattedStr: string;
        validateSeed(val as unknown as string | Uint8Array);
        if (typeof val === 'string') {
          formattedStr = val.toUpperCase();
        } else {
          // It's a Uint8Array
          formattedStr = bytesToHex(val as unknown as Uint8Array).toUpperCase();
        }

        target.set.call(this, formattedStr as V);
      },
      init(initialValue: V): V {
        return initialValue;
      }
    };
  };
}
