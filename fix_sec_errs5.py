# Even without my changes, `tests/protocol/PayloadMapper.exhaustive.test.ts` fails!
# Which means one of my OTHER files changed caused it?
# Let's see what is changed!
import subprocess
subprocess.run(['git', 'status'])
