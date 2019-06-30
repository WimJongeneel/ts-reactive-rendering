import { createElement, createText } from "./virtual_dom";
import { createDiff } from "./diffs";
import { renderDOM, applyUpdate } from "./render";

const app = createElement(
  'div',
  { 'id': 'root' },
  {
    'h1': createElement(
      'h1',
      { 'class': 'header' },
      { 'txt': createText('hello world') }
    )
  }
)

const app1 = createElement(
  'div',
  { 'id': 'root-updated' },
  {
    'h1': createElement(
      'h1',
      { 'class': 'header-updated', id: 'id-new' },
      { 'txt': createText('hello world update') }
    )
  }
)

const rootElem = renderDOM('root', app)


const diff = createDiff(app, app1)
console.log(JSON.stringify(diff, null, '  '))

applyUpdate(rootElem, diff)