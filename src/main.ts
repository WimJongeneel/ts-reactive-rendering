import { createElement, createText } from "./virtual_dom";
import { createDiff } from "./diffs";
import { renderDOM, applyUpdate } from "./render";

const app = createElement(
  'div',
  { 'id': 'root' },
  new Map().set(
    'h1', createElement(
      'h1',
      { 'class': 'header' },
      new Map().set('txt', createText('hello world'))
    )
  )
)

const app1 = createElement(
  'div',
  { 'id': 'root-updated' },
  new Map().set(
    'h1', createElement(
      'h1',
      { 'class': 'header-updated', id: 'id-new' },
      new Map().set('txt', createText('hello world update'))
    )
  ).set(
    'h3', createElement(
      'h3',
      {},
      new Map().set('txt', createText('h3'))
    )
  )
)

const app2 = createElement(
  'div',
  { 'id': 'root-updated' },
  new Map().set(
    'h1', createElement(
      'h1',
      { 'class': 'header-updated', id: 'id-new' },
      new Map().set('txt', createText('hello world update'))
    )
  ).set(
    'h7', createElement(
      'h2',
      {},
      new Map().set('txt', createText('h2'))
    )
  ).set(
    'h3', createElement(
      'h3',
      {},
      new Map().set('txt', createText('h3'))
    )
  ).set(
    'h4', createElement(
      'h3',
      {},
      new Map().set('txt', createText('h4'))
    )
  )
)

const app3 = createElement(
  'div',
  { 'id': 'root-updated' },
  new Map().set(
    'h1', createElement(
      'h1',
      { 'class': 'header-updated', id: 'id-new' },
      new Map().set('txt', createText('hello world update'))
    )
  ).set(
    'h4', createElement(
      'h3',
      {},
      new Map().set('txt', createText('h4 new'))
    )
  )
)

const app4 = createElement(
  'div',
  { 'id': 'root-updated' },
  new Map().set(
    'h1', createElement(
      'h1',
      { 'class': 'header-updated', id: 'id-new' },
      new Map().set('txt', createText('hello world update'))
    )
  ).set(
    'asd', createElement(
      'span',
      {},
      new Map().set('txt', createText('span'))
    )
  )
  .set(
    'h4', createElement(
      'h3',
      {},
      new Map().set('txt', createText('h4 new'))
    )
  )
)

const rootElem = renderDOM('root', app)


const diff = createDiff(app, app1)
console.log(JSON.stringify(diff, null, '  '))
applyUpdate(rootElem, diff)

const diff1 = createDiff(app1, app2)
console.log(JSON.stringify(diff1, null, '  '))
applyUpdate(rootElem, diff1)

const diff2 = createDiff(app2, app3)
console.log(JSON.stringify(diff2, null, '  '))
applyUpdate(rootElem, diff2)

const diff3 = createDiff(app3, app4)
console.log(JSON.stringify(diff3, null, '  '))
applyUpdate(rootElem, diff3)