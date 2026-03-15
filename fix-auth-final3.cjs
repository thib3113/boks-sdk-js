const fs = require('fs');

let authBase = fs.readFileSync('src/protocol/downlink/_AuthPacketBase.ts', 'utf-8');
authBase = authBase.replace(
  "this.configKey = typeof props === 'string' ? props : props.configKey;",
  "this.configKey = props.configKey;"
);
fs.writeFileSync('src/protocol/downlink/_AuthPacketBase.ts', authBase, 'utf-8');

let boksEvent = fs.readFileSync('src/protocol/uplink/history/_BoksHistoryEventBase.ts', 'utf-8');
boksEvent = boksEvent.replace(
  "this.age = typeof props === 'number' ? props : props.age;",
  "this.age = props.age;"
);
fs.writeFileSync('src/protocol/uplink/history/_BoksHistoryEventBase.ts', boksEvent, 'utf-8');
