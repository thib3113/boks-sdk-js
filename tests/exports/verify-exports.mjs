import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { createRequire } from 'module';

const DIST_DIR = join(process.cwd(), 'dist');

let hasError = false;

function reportError(file, message) {
  hasError = true;
  if (process.env.GITHUB_ACTIONS) {
    console.log(`::error file=${file}::${message}`);
  } else {
    console.error(`[ERROR] ${file}: ${message}`);
  }
}

function reportSuccess(file, message) {
  console.log(`✅ [OK] ${file}: ${message}`);
}

async function verifyESM(filePath, expectedExports) {
  if (!existsSync(filePath)) {
    reportError(filePath, `File does not exist.`);
    return;
  }

  try {
    const code = readFileSync(filePath, 'utf-8');

    // Minified esbuild esm output usually looks like: `export { A as BoksClient, B as BoksSimulator };`
    // We will look for ` as ExportName,` or ` as ExportName}`.
    for (const exp of expectedExports) {
      const regex = new RegExp(` as ${exp}[,}]|export \\{.*?\\b${exp}\\b.*?\\}`, 'g');
      if (!regex.test(code)) {
        // Secondary check: sometimes it's just `export { BoksClient };` unaliased
        const unaliasedRegex = new RegExp(`export \\{.*?\\b${exp}\\b.*?\\}`, 'g');
        if (!unaliasedRegex.test(code)) {
          reportError(filePath, `Missing expected export: ${exp}`);
        }
      }
    }

    if (!hasError) {reportSuccess(filePath, `All expected ESM exports found.`);}
  } catch (err) {
    reportError(filePath, `Failed to load ESM module: ${err.message}`);
  }
}

async function verifyCJS(filePath, expectedExports) {
  if (!existsSync(filePath)) {
    reportError(filePath, `File does not exist.`);
    return;
  }

  try {
    const require = createRequire(import.meta.url);
    const mod = require(filePath);

    for (const exp of expectedExports) {
      if (!(exp in mod)) {
        reportError(filePath, `Missing expected export: ${exp}`);
      }
    }

    if (!hasError) {reportSuccess(filePath, `All expected CJS exports found.`);}
  } catch (err) {
    reportError(filePath, `Failed to load CJS module: ${err.message}`);
  }
}

async function verifyIIFE(filePath, globalVar, expectedExports) {
  if (!existsSync(filePath)) {
    reportError(filePath, `File does not exist.`);
    return;
  }

  try {
    const code = readFileSync(filePath, 'utf-8');

    // Very basic IIFE evaluation environment
    const sandbox = {
      window: {},
      document: {},
      navigator: { userAgent: 'node', bluetooth: { requestDevice: () => {} } },
      console: { log: () => {}, warn: () => {}, error: () => {} }
    };

    // Execute code in simulated global scope
    const scriptFunc = new Function(
      ...Object.keys(sandbox),
      code + `\nreturn typeof ${globalVar} !== 'undefined' ? ${globalVar} : undefined;`
    );

    const mod = scriptFunc(...Object.values(sandbox));

    if (!mod) {
      reportError(filePath, `Global variable '${globalVar}' not defined by IIFE.`);
      return;
    }

    for (const exp of expectedExports) {
      if (!(exp in mod)) {
        reportError(filePath, `Missing expected export: ${exp}`);
      }
    }

    if (!hasError) {reportSuccess(filePath, `All expected IIFE exports found.`);}
  } catch (err) {
    reportError(filePath, `Failed to evaluate IIFE module: ${err.message}`);
  }
}

async function runAllChecks() {
  console.log(`🔍 Verifying Build Exports in ${DIST_DIR}...\n`);

  // Use only actually exported members per file.
  const sdkExports = [
    'BoksClient',
    'BoksProtocolError',
    'BoksClientError',
    'BoksController',
    'WebBluetoothTransport',
    'BoksPacketFactory'
  ];
  const coreExports = ['BoksProtocolError', 'BoksPacketFactory']; // These are truly from core.ts (and utils)
  const simulatorExports = ['SimulatorTransport', 'BoksHardwareSimulator']; // Found these in src/simulator

  // Check ESM
  await verifyESM(join(DIST_DIR, 'esm', 'boks-sdk.js'), sdkExports);
  await verifyESM(join(DIST_DIR, 'esm', 'core.js'), coreExports);
  await verifyESM(join(DIST_DIR, 'esm', 'simulator.js'), simulatorExports);

  // Check CJS (Now a single unified bundle for identity resilience)
  await verifyCJS(join(DIST_DIR, 'cjs', 'boks-sdk.cjs'), [...sdkExports, ...coreExports, ...simulatorExports]);

  // Check IIFE (Browser)
  await verifyIIFE(join(DIST_DIR, 'boks-sdk.js'), 'BoksSDK', sdkExports);
  await verifyIIFE(join(DIST_DIR, 'boks-core.js'), 'BoksSDK', coreExports);
  await verifyIIFE(join(DIST_DIR, 'simulator.js'), 'BoksSDK', simulatorExports);

  if (hasError) {
    console.error(`\n❌ Export verification failed. Check errors above.`);
    process.exit(1);
  } else {
    console.log(`\n🎉 All exports verified successfully!`);
  }
}

runAllChecks();
