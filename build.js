import * as esbuild from 'esbuild';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function build() {
    console.log('🚀 Starting Universal Build for @thib3113/boks-sdk...');

    await fs.rm('dist', { recursive: true, force: true });
    await fs.mkdir('dist', { recursive: true });
    await fs.mkdir('dist/esm', { recursive: true });
    await fs.mkdir('dist/cjs', { recursive: true });

    // 1. Browser Bundles (IIFE)
    console.log('📦 Building Browser Bundles (IIFE)...');
    await esbuild.build({
        entryPoints: {
            'boks-sdk': 'src/index.ts',
            'boks-client': 'src/client.ts',
            'boks-core': 'src/core.ts'
        },
        bundle: true,
        outdir: 'dist',
        minify: true,
        sourcemap: true,
        target: ['es2017'],
        format: 'iife',
        globalName: 'BoksSDK',
        platform: 'browser',
    });

    // 2. ESM Bundles
    console.log('📦 Building ESM Bundles...');
    await esbuild.build({
        entryPoints: {
            'boks-sdk': 'src/index.ts',
            'client': 'src/client.ts',
            'core': 'src/core.ts'
        },
        bundle: true,
        outdir: 'dist/esm',
        minify: true,
        sourcemap: true,
        target: ['esnext'],
        format: 'esm',
        packages: 'external',
    });

    // 3. CJS Bundles
    console.log('📦 Building CJS Bundles...');
    await esbuild.build({
        entryPoints: {
            'boks-sdk': 'src/index.ts',
            'client': 'src/client.ts',
            'core': 'src/core.ts'
        },
        bundle: true,
        outdir: 'dist/cjs',
        outExtension: { '.js': '.cjs' },
        minify: true,
        sourcemap: true,
        target: ['es2017'],
        format: 'cjs',
        packages: 'external',
    });

    // 4. Type Definitions
    console.log('📝 Generating Type Definitions...');
    try {
        await execAsync('npx tsc --project tsconfig.types.json');
    } catch (err) {
        console.error('❌ Type generation failed:', err.stdout || err.message);
        throw err;
    }

    console.log('✅ Build complete! Output in /dist');
}

build().catch(err => {
    console.error(err);
    process.exit(1);
});
