import { createElement } from 'million';
import { h } from 'million/jsx-runtime';

const vnode = h('div', undefined, 'Hello!');

document.body.appendChild(createElement(vnode));
