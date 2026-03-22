with open('tests/protocol/PayloadMapper.exhaustive.test.ts', 'r') as f:
    content = f.read()

# Let's see what is syntax error in PayloadMapper.exhaustive.test.ts
# In `ExhaustiveTestPacket` class definition, wait, let me check the syntax.
# The error might be because I replaced `bytesToMac` with `bytesToHex as bytesToMac` somewhere that caused the import to break... No, I reset tests!
# Is it `src/protocol/decorators/PayloadMapper.ts` that exports invalid stuff?
# Let's inspect PayloadMapper.exhaustive.test.ts.
