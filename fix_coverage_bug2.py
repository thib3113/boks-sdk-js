import re

with open('src/utils/converters.ts', 'r') as f:
    content = f.read()

# Replace INVALID_VALUE with ODD_LENGTH when string is odd
content = content.replace("BoksProtocolErrorId.INVALID_VALUE", "BoksProtocolErrorId.INVALID_VALUE")

# Ah, looking at my `fix_final.py` from earlier, `hexToBytes` was redefined and the original `cleanHexString` was correctly integrated.
# BUT wait! My `fix_final.py` used `if "export const cleanHexString" not in content:` but it WAS in content, so my `cleanHexString` logic was NEVER updated to ignore all characters!
# That means `hexToBytes` still uses the OLD implementation!
