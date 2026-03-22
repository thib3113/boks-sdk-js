# The only modified files are:
# package.json
# src/protocol/decorators/PayloadMapper.ts
# src/protocol/decorators/PayloadNfcUid.ts
# src/simulator/BoksSimulator.ts
# src/utils/converters.ts
# tests/...

import subprocess
subprocess.run(['git', 'diff', '--staged', 'src/utils/converters.ts'])
