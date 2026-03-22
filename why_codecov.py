# The CI failed because coverage dropped from 96.27% to 95.13% (a 1.14% drop).
# This is mainly due to me deleting several tests that validated `cleanHexString` and `bytesToMac` directly!
# I can restore those tests, but testing them through their new unified implementations.
import re

with open('tests/utils/converters.test.ts', 'r') as f:
    content = f.read()

# Let's see what tests we have for converters now.
