import re

with open('tests/protocol/resilience/payload-mapper-coverage.test.ts', 'r') as f:
    content = f.read()

# Make sure imports are valid
if "import { getOrCreateMetadata, PayloadMasterCodeIndex, PayloadByteArray, PayloadVarLenHex } from '@/protocol/payload-mapper';" not in content:
    content = content.replace("import { getOrCreateMetadata } from '@/protocol/payload-mapper';", "import { getOrCreateMetadata, PayloadMasterCodeIndex, PayloadByteArray, PayloadVarLenHex } from '@/protocol/payload-mapper';")

# Wait, the error is `ReferenceError: PayloadMasterCodeIndex is not defined`.
# It means the import is missing or replaced wrongly. Let's fix that.
if 'PayloadMasterCodeIndex' not in content[:500]: # check top imports
    # maybe it was just missing `PayloadMasterCodeIndex` inside `{ ... }`
    content = "import { PayloadMasterCodeIndex, PayloadByteArray, PayloadVarLenHex } from '@/protocol/payload-mapper';\n" + content

with open('tests/protocol/resilience/payload-mapper-coverage.test.ts', 'w') as f:
    f.write(content)

with open('tests/protocol/uplink/BoksRXPacketBase.test.ts', 'r') as f:
    content = f.read()

if 'BoksOpcode' not in content[:500]:
    content = "import { BoksOpcode } from '@/protocol/constants';\n" + content

with open('tests/protocol/uplink/BoksRXPacketBase.test.ts', 'w') as f:
    f.write(content)
