const fs = require('fs');

let nfcOpen = fs.readFileSync('src/protocol/uplink/history/NfcOpeningHistoryPacket.ts', 'utf-8');
nfcOpen = nfcOpen.replace('(data as any).nfcUidData', '(data as unknown as { nfcUidData: string }).nfcUidData');
fs.writeFileSync('src/protocol/uplink/history/NfcOpeningHistoryPacket.ts', nfcOpen, 'utf-8');
