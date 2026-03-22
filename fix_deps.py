# Ah!
# Did I remove something in `package.json` while `npm install` updated other stuff?
# I see `@babel/plugin-proposal-decorators`. Was it in `devDependencies` and removed?
# Let's inspect HEAD package.json
import subprocess
subprocess.run(['git', 'checkout', 'HEAD', '--', 'package.json'])
subprocess.run(['npm', 'ci'])
