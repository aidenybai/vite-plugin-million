import { Plugin } from 'vite';
import MagicString from 'magic-string';
import { h } from 'million/jsx-runtime';
import devalue from 'devalue';

const createPlugins = (): Plugin[] => {
  let useSourceMap = false;
  const loadCache: Map<
    string,
    { data?: any; code?: string; watchFiles?: string[] }
  > = new Map();
  return [
    {
      name: 'compiler',
      enforce: 'pre',
      configResolved(config) {
        useSourceMap = !!config.build.sourcemap;
      },
      configureServer(server) {
        server.watcher.on('all', (_, id) => {
          for (const [k, cache] of loadCache) {
            if (cache.watchFiles?.includes(id)) {
              loadCache.delete(k);
            }
          }
        });
      },
      async transform(code, id) {
        if (id.includes('node_modules') || !/\.(js|ts|mjs)$/.test(id)) return;

        const matches = [...code.matchAll(/(h\(.+\))/g)];

        if (matches.length === 0) return;

        const string = new MagicString(code);
        for (const item of matches) {
          const start = item.index!;
          const end = item.index! + item[0].length;

          try {
            const data = new Function('h', `return ${item[1]}`)(h);

            string.overwrite(start, end, devalue(data));
          } catch (_err) {}
        }
        return {
          code: string.toString(),
          map: useSourceMap ? string.generateMap({ source: id }) : null,
        };
      },
    },
  ];
};

export default createPlugins;
