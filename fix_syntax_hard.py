import re

with open('src/protocol/decorators/PayloadMapper.ts', 'r') as f:
    content = f.read()

# Let's manually inspect PayloadMapper.ts for invalid characters, like zero-width spaces or stray template literal brackets.
# Print lines around 'mac_address'
lines = content.split('\n')
for i, line in enumerate(lines):
    if 'case \'mac_address\':' in line:
        print("LINES AROUND MAC_ADDRESS:")
        for j in range(i-5, i+15):
            print(f"{j+1}: {repr(lines[j])}")
        break
