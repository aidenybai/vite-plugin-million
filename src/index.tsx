import { createElement } from 'million';

let hello = 'Hello!';

const vnode = <div>Hello World</div>;

document.body.appendChild(createElement(vnode));
