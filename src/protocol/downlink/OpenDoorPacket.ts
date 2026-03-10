import { BoksPacket } from '@/protocol/_BoksPacketBase';
import { BoksOpcode } from '@/protocol/constants';
import { readPinFromBuffer, writePinToBuffer } from '@/utils/converters';
import { validatePinCode } from '@/utils/validation';

export function PayloadPinCode() {
  return function <T, V extends string>(
    target: ClassAccessorDecoratorTarget<T, V>,
    context: ClassAccessorDecoratorContext<T, V>
  ): ClassAccessorDecoratorResult<T, V> | void {
    if (context.kind === 'accessor') {
      return {
        get(this: T): V {
          return target.get.call(this);
        },
        set(this: T, value: V): void {
          validatePinCode(value);
          target.set.call(this, value.toUpperCase() as V);
        },
        init(this: T, initialValue: V): V {
          // Wait to validate if it is initially undefined/uninitialized
          if (initialValue) {
            validatePinCode(initialValue);
            return initialValue.toUpperCase() as V;
          }
          return initialValue;
        }
      };
    }
  };
}

/**
 * Command to open the door with a 6-character PIN.
 */
export class OpenDoorPacket extends BoksPacket {
  static readonly opcode = BoksOpcode.OPEN_DOOR;

  get opcode() {
    return OpenDoorPacket.opcode;
  }

  // We assign a placeholder to pass TS checks; the real value is set in constructor.
  // Using an exclamation mark also works if we configure TS correctly, but
  // explicitly letting initialValue be undefined or valid handles the initialization correctly.
  @PayloadPinCode()
  public accessor pin!: string;

  constructor(pin: string) {
    super();
    // Setting this via the accessor triggers validation automatically
    this.pin = pin;
  }

  static fromPayload(payload: Uint8Array): OpenDoorPacket {
    return new OpenDoorPacket(readPinFromBuffer(payload, 0));
  }

  toPayload(): Uint8Array {
    const payload = new Uint8Array(6);
    writePinToBuffer(payload, 0, this.pin);
    return payload;
  }
}
