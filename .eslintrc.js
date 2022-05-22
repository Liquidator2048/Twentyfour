module.exports = {
    root: true,

    env: {
        node: true,
    },

    extends: [
        'plugin:vue/essential',
        'eslint:recommended',
        '@vue/typescript/recommended',
    ],

    parserOptions: {
        ecmaVersion: 2020,
        parser: '@typescript-eslint/parser',
    },

    rules: {
        'no-console': 'off',
        'no-debugger': 'off',
        'vue/html-quotes': 'warn',
    },

    overrides: [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
                '**/tests/unit/**/*.spec.{j,t}s?(x)',
            ],
            env: {
                jest: true,
            },
        },
    ],
};
