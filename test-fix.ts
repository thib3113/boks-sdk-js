import { EMPTY_BUFFER } from './src/protocol/constants';
import { hexToBytes } from './src/utils/converters';
let payload: Uint8Array = EMPTY_BUFFER;
payload = hexToBytes('test');
