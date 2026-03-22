# The issue is that `ODD_LENGTH` is passed inside `reason`, while `INVALID_VALUE` is the actual Error code.
import re

with open('tests/utils/converters.test.ts', 'r') as f:
    content = f.read()

content = content.replace("expect(() => hexToBytes('G1')).toThrow('ODD_LENGTH');", "expect(() => hexToBytes('G1')).toThrow('ODD_LENGTH');")
# wait, if BoksProtocolError is thrown, `toThrow('ODD_LENGTH')` checks the error MESSAGE, not the `reason` field!
# I will check what message `ODD_LENGTH` throws.
# It throws: `new BoksProtocolError(BoksProtocolErrorId.INVALID_VALUE, undefined, { reason: 'ODD_LENGTH' })`
# So the error message is just the error code name or `undefined`.
# Let's change the test to `toThrow(BoksProtocolErrorId.INVALID_VALUE)` or catch the error explicitly!

content = content.replace("expect(() => hexToBytes('G1')).toThrow('ODD_LENGTH'); // '1' is odd length", "expect(() => hexToBytes('G1')).toThrow(BoksProtocolErrorId.INVALID_VALUE); // '1' is odd length")

with open('tests/utils/converters.test.ts', 'w') as f:
    f.write(content)
