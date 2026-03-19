const fs = require('fs');

let readme = fs.readFileSync('README.md', 'utf8');

const docToAdd = `
## 📦 Subpath Exports (Tree-Shaking Optimization)

To optimize bundle sizes and avoid shipping unused code (e.g., the Bluetooth client if you only need PIN generation, or the simulator if you're building a client app), you can use specific subpath exports. The SDK is split into several modular entry points:

- **\`@thib3113/boks-sdk\`**: The default entry point (Client + Crypto + Protocol).
- **\`@thib3113/boks-sdk/client\`**: Only the Bluetooth Client implementation.
- **\`@thib3113/boks-sdk/crypto\`**: Only the offline PIN generation and crypto functions.
- **\`@thib3113/boks-sdk/protocol\`**: Only raw packet classes and UUID definitions.
- **\`@thib3113/boks-sdk/simulator\`**: Only the Boks Box simulator logic.

### Examples

**1. Using only PIN Generation (Lightweight)**
\`\`\`ts
import { generateBoksPin } from '@thib3113/boks-sdk/crypto';

// Only bundles the PIN generation algorithm, completely skipping Bluetooth / Protocol code.
const pin = await generateBoksPin('YOUR_CONFIG_KEY');
\`\`\`

**2. Using the Bluetooth Client**
\`\`\`ts
import { BoksClient, WebBluetoothTransport } from '@thib3113/boks-sdk/client';

// Does not bundle the simulator
const client = new BoksClient(new WebBluetoothTransport());
\`\`\`

**3. Using the Simulator**
\`\`\`ts
import { BoksSimulator } from '@thib3113/boks-sdk/simulator';

const simulator = new BoksSimulator('MY_CONFIG_KEY');
\`\`\`
`;

// Insert the docs after the ## Table of Contents or Installation
if (readme.includes('## Features')) {
    readme = readme.replace('## Features', docToAdd + '\n## Features');
} else {
    readme += '\n' + docToAdd;
}

fs.writeFileSync('README.md', readme, 'utf8');
