import { child, createElement, createText } from "./virtual_dom";
import { createDiff } from "./diffs";
import { renderDOM, applyUpdate } from "./render";

const app = createElement(
  'div',
  { 'id': 'root' },
  child(
    'h1', createElement(
      'h1',
      { 'class': 'header' },
      child('txt', createText('hello world'))
    )
    )
    .set(
      'xx', createElement(
        'h3',
        {},
        child('txt', createText('h3 first'))
      )
  )
  .set(
    'foo', createElement(
      'div',
      {},
      child('txt', createText('FOO'))
    )
)
)

const app1 = createElement(
  'div',
  { 'id': 'root-updated' },
  child(
    'h3', createElement(
      'h1',
      { 'class': 'header' },
      child('txt', createText('hello world - updated'))
    )
  ).set(
    'xx', createElement(
      'h3',
      {},
      child('txt', createText('h3 new'))
    )
  )
  .set(
    'yy', createElement(
      'h3',
      {},
      child('txt', createText('h3 2nd'))
    )
  )
)

const app2 = createElement(
  'div',
  { 'id': 'root-updated' },
  child(
    'yy', createElement(
      'h3',
      {},
      child('txt', createText('h3 2nd'))
    )
  )
)

const rootElem = renderDOM('root', app)


const diffV2 = createDiff(app, app1, true)
console.log(diffV2)

setTimeout(() => applyUpdate(rootElem, diffV2, rootElem), 1500)

const diffV3 = createDiff(app1, app2, true)
console.log(diffV3)


setTimeout(() => applyUpdate(rootElem, diffV3, rootElem), 3000)
