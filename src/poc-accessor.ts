export function PayloadPinCode(length: number) {
  return function <T, V extends string>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> | void {
    if (context.kind === 'accessor') {
      return {
        get(this: T): V {
          console.log(`Getting value for ${context.name.toString()}`);
          return target.get.call(this);
        },
        set(this: T, value: V): void {
          if (value.length !== length) {
            throw new Error(`Length must be ${length}`);
          }
          console.log(`Setting value for ${context.name.toString()}`);
          target.set.call(this, value);
        },
        init(this: T, initialValue: V): V {
          console.log(`Init value for ${context.name.toString()} to ${initialValue}`);
          return initialValue;
        }
      };
    }
  };
}

export class TestClass {
  @PayloadPinCode(8)
  public accessor pin: string = '12345678';
}

const obj = new TestClass();
console.log(obj.pin);
obj.pin = 'abcdefgh';
console.log(obj.pin);

try {
  obj.pin = '123';
} catch (e: unknown) {
  if (e instanceof Error) {
    console.log('Validation failed as expected:', e.message);
  }
}
