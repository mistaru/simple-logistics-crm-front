/**
 * .eslint.js
 *
 * ESLint configuration file.
 */

import pluginVue from 'eslint-plugin-vue';
import vueTsEslintConfig from '@vue/eslint-config-typescript';

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  ...pluginVue.configs['flat/recommended'],
  ...vueTsEslintConfig(),

  {
    rules: {
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
        },
      ],
      'vue/multi-word-component-names': 'off',
      'no-unused-vars': ['error', { 'args': 'all' , 'argsIgnorePattern': '^_' }],
      'vue/no-v-model-argument': 'off',
      'vue/no-v-html': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/no-mutating-props': ['error', {
        'shallowOnly': true,
      }],
      'vue/multi-word-component-names': 'off',
      'keyword-spacing': ['error'],
      'space-before-blocks': 'error',
      indent: ['error', 2],
      'space-in-parens': ['error', 'never'],
      'no-multiple-empty-lines': ['error', { 'max': 1, 'maxBOF': 2 }],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'never',
        },
      ],
      'object-curly-spacing': ['error', 'always'],
      'space-before-function-paren': ['error', 'never'],
      'key-spacing': ['error', { beforeColon: false }],
      'no-var': 'error',
      'vue/order-in-components': 'error',
      'no-async-promise-executor': 'off',
      'vue/valid-v-slot': ['error', {
        allowModifiers: true,
      }],
    },
  },
];
