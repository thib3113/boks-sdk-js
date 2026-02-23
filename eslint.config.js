import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

// Define custom plugin
const customRulesPlugin = {
  rules: {
    'uppercase-hex': {
      meta: {
        type: 'layout',
        docs: {
          description: 'Enforce uppercase hexadecimal literals'
        },
        fixable: 'code'
      },
      create(context) {
        return {
          Literal(node) {
            if (typeof node.value === 'number' && node.raw && /^0x[0-9a-f]+$/i.test(node.raw)) {
              if (/[a-f]/.test(node.raw)) {
                context.report({
                  node,
                  message: 'Hexadecimal literals must be uppercase.',
                  fix(fixer) {
                    const fixed = '0x' + node.raw.slice(2).toUpperCase();
                    return fixer.replaceText(node, fixed);
                  }
                });
              }
            }
          }
        };
      }
    }
  }
};

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'coverage',
      'examples',
      'public',
      'wiki/.vitepress/cache',
      '**/*.test.ts'
    ]
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      prettier: prettier,
      'custom-rules': customRulesPlugin
    },
    rules: {
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'custom-rules/uppercase-hex': 'error'
    }
  },
  {
    files: ['src/protocol/constants.ts'],
    rules: {
      'prettier/prettier': 'off'
    }
  },
  eslintConfigPrettier
);
