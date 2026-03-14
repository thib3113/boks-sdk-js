import re

with open('tests/protocol/resilience/payload-mapper-coverage.test.ts', 'r') as f:
    content = f.read()

# Add missing imports!
if 'PayloadMasterCodeIndex' not in content:
    content = content.replace("import { getOrCreateMetadata } from '@/protocol/payload-mapper';", "import { getOrCreateMetadata, PayloadMasterCodeIndex, PayloadByteArray, PayloadVarLenHex } from '@/protocol/payload-mapper';")

with open('tests/protocol/resilience/payload-mapper-coverage.test.ts', 'w') as f:
    f.write(content)


with open('tests/protocol/uplink/BoksRXPacketBase.test.ts', 'r') as f:
    content = f.read()

# Remove the duplicated / wrongly indented `it` block inside other `it` blocks
# It seems my replace `});\n` failed and inserted it multiple times or in wrong spot
# Let's completely replace it
content = re.sub(r"\s*it\('should return EMPTY_BUFFER if rawPayload is empty or undefined'.*?\}\);\n", "", content, flags=re.DOTALL)

test_base = '''
  it('should return EMPTY_BUFFER if rawPayload is empty or undefined', () => {
    class TestRXPacket2 extends BoksRXPacket {}
    const packet = new TestRXPacket2(BoksOpcode.NOTIFY_NFC_TAG_REGISTERED, undefined);
    expect(packet.toPayload()).toEqual(new Uint8Array(0));
  });
'''
# insert before the final describe closing
content = content[:content.rfind('});')] + test_base + '});\n'

with open('tests/protocol/uplink/BoksRXPacketBase.test.ts', 'w') as f:
    f.write(content)
