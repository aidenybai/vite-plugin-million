import { Plugin } from 'vite';
import { parse, print, visit, types } from 'recast';
import { Path } from 'ast-types/lib/path';
import { VFlags } from 'million';

const { literal, property, objectExpression, arrayExpression } = types.builders;

const vnode = (
  value: Path['value'],
  key?: string
): types.namedTypes.ObjectExpression => {
  const children = value.arguments.slice(2);
  const normalizedChildren = [];
  let flag = VFlags.ANY_CHILDREN;
  let keyed = true;

  if (children.length === 0) flag = VFlags.NO_CHILDREN;
  else if (
    children.every(
      (child: types.namedTypes.Literal) => child.type === 'Literal'
    )
  )
    flag = VFlags.ONLY_TEXT_CHILDREN;
  for (const child of flat(children)) {
    if (child.type === 'CallExpression' && child.callee.name === 'h') {
      let key = undefined;
      if (
        !child.arguments[1]?.properties?.some(
          (prop: types.namedTypes.Property) => {
            const hasKey =
              (<types.namedTypes.Identifier>prop.key).name === 'key';
            if (hasKey) key = (<types.namedTypes.Literal>prop.value).value;

            return hasKey;
          }
        )
      )
        keyed = false;
      normalizedChildren.push(vnode(child, key));
    } else {
      if (child.type === 'Literal' && typeof child.value !== 'string')
        normalizedChildren.push(literal(String(child.value)));
      else normalizedChildren.push(child);
    }
  }
  if (keyed) flag = VFlags.ONLY_KEYED_CHILDREN;
  const properties = [
    property('init', literal('tag'), value.arguments[0]),
    property('init', literal('props'), value.arguments[1]),
    property('init', literal('children'), arrayExpression(normalizedChildren)),
    property('init', literal('flag'), literal(flag)),
  ];
  if (key) properties.push(property('init', literal('key'), literal(key)));
  return objectExpression(properties);
};

const flat = (arr: Path['value'][], depth = 1): Path['value'][] => {
  return depth > 0
    ? arr.reduce(
        (acc: Path['value'][], val) =>
          acc.concat(Array.isArray(val) ? flat(val, depth - 1) : val),
        []
      )
    : arr.slice();
};

const createPlugins = (): Plugin[] => {
  return [
    {
      name: 'million',
      async transform(code, id) {
        if (id.includes('node_modules') || !/\.(js|ts|mjs|jsx|tsx)$/.test(id))
          return;

        const ast = parse(code);
        const callExpressionPaths: Path[] = [];

        const pushCallExpressionPaths = (path: Path) => {
          if (path.value.callee.name === 'h') {
            callExpressionPaths.push(path);
          }
        };

        visit(ast, {
          visitCallExpression(path: Path) {
            pushCallExpressionPaths(path);
            this.traverse(path);
          },
        });

        for (const path of callExpressionPaths) {
          path.replace(vnode(path.value));
        }

        return { code: print(ast).code };
      },
    },
  ];
};

export default createPlugins;
