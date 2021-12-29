import { defineConfig } from 'vite';
import compiler from './src/compiler';

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, jsxs, Fragment } from 'million/jsx-runtime'`,
  },
  plugins: [compiler()],
});
