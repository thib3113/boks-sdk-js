# The tests fail because the code was restored to original (which doesn't support a-f, nor reverse) and tests expect the new behaviour but I removed my fix to test something else.
# AND there are some broken imports we didn't fully commit!
# Since I stashed all my changes earlier and didn't reapply them properly during debug, the codebase is in a dirty state.
# Let's properly apply our fix to `src/utils/converters.ts` and `src/protocol/decorators/PayloadMapper.ts` cleanly.
import subprocess
subprocess.run(['python3', 'fix_everything.py'])
subprocess.run(['python3', 'fix_everything3.py'])
subprocess.run(['python3', 'fix_final_converters.py'])
subprocess.run(['python3', 'fix_final_nfc_sim.py'])
subprocess.run(['python3', 'fix_sim_imports.py'])
subprocess.run(['python3', 'test_final_fix.py'])
