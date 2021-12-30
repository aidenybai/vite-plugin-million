# vite-plugin-million

> ⚡ Million.js' compiler powered by Vite.js.

Generate raw objects instead of virtual node `h` calls.

Please note that this is not a full replacement of `million/jsx-runtime`. It only supports basic children normalization, flag resolution. It does not support the `kebab`, `className`, `style`, or `delta` helpers or JSX automatic runtime.

## Install

```sh
npm install --save-dev vite-plugin-million
```

`vite.config.ts`

```ts
import { defineConfig } from 'vite';
import million from 'vite-plugin-million';

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, jsxs, Fragment } from 'million/jsx-runtime'`,
  },
  plugins: [million()],
});
```

`tsconfig.json`

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "jsx": "react-jsx",
    "jsxImportSource": "million"
  }
}
```

## License

babel-preset-million is [MIT-licensed](LICENSE) open-source software by [Aiden Bai](https://github.com/aidenybai).
