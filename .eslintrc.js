module.exports = {
    env: {
        es6: true,
        node: true
    },
    parserOptions: {
        ecmaVersion: 2017
    },
    extends: 'eslint:recommended',
    rules: {
        indent: ['error', 4],
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
        'no-console': 'off',
        'comma-dangle': ['error', 'never'],
        'no-multi-spaces': ['error', { exceptions: { Property: false } }],
        'key-spacing': ['error'],
        'no-multiple-empty-lines': 'error',
        'space-in-parens': ['error', 'never']
    }
};
