import subprocess
# Restore everything.
subprocess.run(['git', 'checkout', 'HEAD', '--', '.'])
