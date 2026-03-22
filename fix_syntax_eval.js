// Let's create a script that attempts to compile each JIT function and logs the syntax error.
import { PayloadMapper } from './src/protocol/decorators/PayloadMapper.js';
import { BoksProtocolError } from './src/errors/BoksProtocolError.js';
import { hexToBytes, bytesToHex } from './src/utils/converters.js';

// Oh wait, TS files.
