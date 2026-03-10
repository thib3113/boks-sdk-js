export function PayloadPinCode(length: number) {
  return function (target: any, context: ClassAccessorDecoratorContext) {
    if (context.kind === 'accessor') {
      return {
        get() {
          console.log(`Getting value for ${context.name.toString()}`);
          return target.get.call(this);
        },
        set(value: string) {
          if (value.length !== length) {
            throw new Error(`Length must be ${length}`);
          }
          console.log(`Setting value for ${context.name.toString()}`);
          target.set.call(this, value);
        },
        init(initialValue: string) {
          console.log(`Init value for ${context.name.toString()} to ${initialValue}`);
          return initialValue;
        }
      };
    }
    return;
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
} catch (e: any) {
  console.log('Validation failed as expected:', e.message);
}
