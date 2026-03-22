# The CI failed specifically with:
# [WARNING] File: src/utils/converters.ts, Line: 5
# Message: Delete `⏎`
# This means prettier/eslint is failing due to formatting (an extra newline) at line 5 of `src/utils/converters.ts`.
# Let's fix that!

import re

with open('src/utils/converters.ts', 'r') as f:
    content = f.read()

# Just run eslint --fix
import subprocess
subprocess.run(['npx', 'eslint', 'src/utils/converters.ts', '--fix'])
