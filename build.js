import { createAndUploadReport } from '@codecov/bundle-analyzer';
import * as esbuild from 'esbuild';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const pkg = JSON.parse(await fs.readFile('./package.json', 'utf-8'));

async function build() {
    console.log(`🚀 Starting Universal Build for ${pkg.name} v${pkg.version}...`);

    await fs.rm('dist', { recursive: true, force: true });
    await fs.mkdir('dist', { recursive: true });
    await fs.mkdir('dist/esm', { recursive: true });
    await fs.mkdir('dist/cjs', { recursive: true });

    const banner = `/**
 * ${pkg.name} v${pkg.version}
 * Unofficial Boks SDK
 * 
 * GitHub: https://github.com/thib3113/boks-sdk-js
 * Build Run: https://github.com/thib3113/boks-sdk-js/actions/runs/${process.env.GITHUB_RUN_ID || 'local'}
 * Attestation: This build is cryptographically attested on GitHub.
 */`;

    // 1. Browser Bundles (IIFE)
    console.log('📦 Building Browser Bundles (IIFE)...');
    await esbuild.build({
        entryPoints: {
            'boks-sdk': 'src/index.ts',
            'boks-core': 'src/core.ts',
            'simulator': 'src/simulator.ts'
        },
        bundle: true,
        outdir: 'dist',
        minify: true,
        sourcemap: true,
        target: ['es2022'],
        format: 'iife',
        globalName: 'BoksSDK',
        platform: 'browser',
        banner: { js: banner },
    });

    // 2. ESM Bundles
    console.log('📦 Building ESM Bundles...');
    await esbuild.build({
        entryPoints: {
            'boks-sdk': 'src/index.ts',
            'core': 'src/core.ts',
            'simulator': 'src/simulator.ts'
        },
        bundle: true,
        outdir: 'dist/esm',
        minify: true,
        sourcemap: true,
        target: ['es2022'],
        format: 'esm',
        splitting: true, // <--- ACTIVE LE PARTAGE DE CODE
        packages: 'external',
    });

    // 3. CJS Bundle (Single Flat Bundle for Identity Resilience)
    console.log('📦 Building CJS Bundle (Full)...');
    await esbuild.build({
        entryPoints: {
            'boks-sdk': 'src/all.ts'
        },
        bundle: true,
        outdir: 'dist/cjs',
        outExtension: { '.js': '.cjs' },
        minify: true,
        sourcemap: true,
        target: ['es2022'],
        format: 'cjs',
        packages: 'external',
    });

    // 4. Type Definitions
    console.log('📝 Generating Type Definitions...');
    try {
        await execAsync('npx tsc --project tsconfig.types.json');

        // Copy .d.ts files to .d.cts for CommonJS support in modern Node
        console.log('📝 Cloning Type Definitions for CJS (.d.cts)...');
        async function copyToCts(dir) {
            const files = await fs.readdir(dir, { withFileTypes: true });
            for (const file of files) {
                const fullPath = `${dir}/${file.name}`;
                if (file.isDirectory()) {
                    await copyToCts(fullPath);
                } else if (file.name.endsWith('.d.ts')) {
                    const ctsPath = fullPath.replace(/\.d\.ts$/, '.d.cts');
                    await fs.copyFile(fullPath, ctsPath);
                }
            }
        }
        await copyToCts('dist/types');
    } catch (err) {
        console.error('❌ Type generation failed:', err.stdout || err.message);
        throw err;
    }

    console.log('✅ Build complete! Output in /dist');


    // 5. Codecov Bundle Analysis
    console.log('📊 Analyzing bundles with Codecov...');
    try {
        const isCI = process.env.PUBLISH_BUNDLE_ANALYSE === 'true';

        // Lire le token depuis codecov.yml
        let uploadToken;
        try {
            const codecovYml = await fs.readFile('./codecov.yml', 'utf-8');
            const tokenMatch = codecovYml.match(/token:\s*([\w-]+)/);
            if (tokenMatch && tokenMatch[1]) {
                uploadToken = tokenMatch[1];
            }
        } catch (e) {
            console.warn("⚠️ Could not read uploadToken from codecov.yml:", e.message);
        }

        const coreOpts = {
            dryRun: !isCI,
            enableBundleAnalysis: true,
            uploadToken: uploadToken,
        };

        const bundlesToAnalyze = [
            // Browser (IIFE)
            { name: `${pkg.name}-iife`, file: 'boks-sdk.js', dir: 'dist' },
            { name: `core-iife`, file: 'boks-core.js', dir: 'dist' },
            { name: `simulator-iife`, file: 'simulator.js', dir: 'dist' },

            // ESM
            { name: `${pkg.name}-esm`, file: 'boks-sdk.js', dir: 'dist/esm' },
            { name: `core-esm`, file: 'core.js', dir: 'dist/esm' },
            { name: `simulator-esm`, file: 'simulator.js', dir: 'dist/esm' },

            // CJS (Single Bundle)
            { name: `${pkg.name}-cjs`, file: 'boks-sdk.cjs', dir: 'dist/cjs' },
        ];

        // We create a temporary directory to isolate files for Codecov
        const tempDir = '.codecov_temp_dist';

        for (const bundle of bundlesToAnalyze) {
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
                await fs.mkdir(tempDir, { recursive: true });

                const sourcePath = `${bundle.dir}/${bundle.file}`;
                const destPath = `${tempDir}/${bundle.file}`;

                // Copy the specific file we want to analyze to the temp dir
                await fs.copyFile(sourcePath, destPath);

                const opts = { ...coreOpts, bundleName: bundle.name };

                await createAndUploadReport([tempDir], opts);
                console.log(`✅ Report generated and uploaded for bundle: ${bundle.name}`);
            } catch (err) {
                 console.error(`❌ Failed to generate or upload report for ${bundle.name}:`, err.message);
            }
        }

        // Clean up temp dir
        await fs.rm(tempDir, { recursive: true, force: true });
        console.log(`✅ All bundle reports processed (DryRun: ${!isCI}).`);

    } catch (err) {
        console.error("❌ Failed during codecov bundle analysis:", err);
        // Do not fail the entire build if analysis fails
    }


}

build().catch(err => {
    console.error(err);
    process.exit(1);
});
