# A virtual DOM in typescirpt

This project contains a virtual DOM implementation in TypeScript.

## Virtual DOM explained

Dealing with the DOM in a SPA is a huge task. Because the DOM is reeeaaaaly slow we need to make as few updates as possible. When updating the DOM we should also be carefull with replacing elements because this will make the user lose his tabfocus etc. The idea of a virtual DOM is that the application is not going to borther at all with those challenges and outputs a completely new DOM everytime it wants to update something. The virtual DOM will then compare the new DOM with the existing one and create a diff. This diff contains all the changes that should be made to the dom. After this the virtual DOM will apply those changes while trying to update as little as possible.

## The library

This library contains tree main modules: the virtual DOM, the diffing and the render. Those are split between the files. The virtual DOM is a tree based type that describes the HTML. This module also contains factory methods for easier use. The diffing function creates a diff object from two DOMs. It will create it's own tree shaped datastructure that contains all the updates. At last, the render module will render a virtual DOM in the real DOM and apply the diffs genereted by the diffing module.

## Example

Create a DOM:

```ts
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

const rootElem = renderDOM('root', app)
```

Create second version of this DOM with some changes:

```ts
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
```

Create and apply the diff:

```ts
const diff = createDiff(app, app1)

applyUpdate(rootElem, diff)
```

This example will create and apply the following update. Note that it will update the `div` and the `h1` and only replace the textnode instead of replacing the entire tree.

```json
{
  "kind": "update",
  "attributes": {
    "delete": [],
    "set": {
      "id": "root-updated"
    }
  },
  "childeren": [
    {
      "kind": "update",
      "attributes": {
        "delete": [],
        "set": {
          "class": "header-updated",
          "id": "id-new"
        }
      },
      "childeren": [
        {
          "kind": "replace",
          "newNode": {
            "kind": "text",
            "text": "hello world update"
          }
        }
      ]
    }
  ]
}
```
