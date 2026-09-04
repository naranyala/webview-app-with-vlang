const path = require('node:path');
const preactModule = require('@preact/preset-vite');
const preact = preactModule.default || preactModule;

module.exports = {
  plugins: [preact()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.jsx']
  },
  resolve: {
    alias: {
      '@stylexjs/stylex': path.resolve(__dirname, 'test/stylex-stub.js')
    }
  }
};
