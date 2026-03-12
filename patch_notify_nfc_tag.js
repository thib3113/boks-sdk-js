const fs = require('fs');
const file = 'src/protocol/uplink/NotifyNfcTagFoundPacket.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "import { bytesToHex } from '@/utils/converters';",
  "import { bytesToHex } from '@/utils/converters';\nimport { BoksProtocolError, BoksProtocolErrorId } from '@/errors/BoksProtocolError';"
);

code = code.replace(
  "public readonly uid: string = '',",
  "public readonly uid: string,"
);

code = code.replace(
  "static fromPayload(payload: Uint8Array): NotifyNfcTagFoundPacket {\n    const uid = bytesToHex(payload);\n    return new NotifyNfcTagFoundPacket(uid, payload);\n  }",
  `static fromPayload(payload: Uint8Array): NotifyNfcTagFoundPacket {
    if (payload.length < 1) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.MALFORMED_DATA,
        'Payload too short for NotifyNfcTagFoundPacket',
        { length: payload.length }
      );
    }
    const uidLength = payload[0];
    if (uidLength > 4) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.MALFORMED_DATA,
        'UID length greater than 4 is not supported',
        { length: uidLength }
      );
    }
    if (payload.length < 1 + uidLength) {
      throw new BoksProtocolError(
        BoksProtocolErrorId.MALFORMED_DATA,
        'Payload too short for specified UID length',
        { length: payload.length, expected: 1 + uidLength }
      );
    }
    const uidBytes = payload.subarray(1, 1 + uidLength);
    const uid = bytesToHex(uidBytes);
    return new NotifyNfcTagFoundPacket(uid, payload);
  }`
);

fs.writeFileSync(file, code);
