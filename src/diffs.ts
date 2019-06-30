import { VDomNode } from "./virtual_dom";

type AttributesUpdater = {
  set: { [_: string]: string | number | boolean }
  delete: string[]
}

type ChildUpdater =
  | VDomNodeUpdater
  | { kind: 'insert', node: VDomNode }

export type VDomNodeUpdater = {
  kind: 'update',
  attributes: AttributesUpdater,
  childeren: ChildUpdater[]
} | {
  kind: 'replace',
  newNode: VDomNode
} | {
  kind: 'delete'
} | {
  kind: 'skip'
}


export const createDiff = (oldNode: VDomNode, newNode: VDomNode): VDomNodeUpdater => {
  if (oldNode.kind == 'text' && newNode.kind == 'text' && oldNode.text == newNode.text) {
    return { kind: 'skip' }
  }

  if (oldNode.kind == 'text' || newNode.kind == 'text') {
    return { kind: 'replace', newNode }
  }

  if (oldNode.tagname != oldNode.tagname) {
    return { kind: 'replace', newNode }
  }

  const attUpdater: AttributesUpdater = {
    delete: Object.keys(oldNode.attributes)
      .filter(att => Object.keys(newNode.attributes).indexOf(att) == -1),
    set: Object.keys(newNode.attributes)
      .filter(att => oldNode.attributes[att] != newNode.attributes[att])
      .reduce((upd, att) => ({ ...upd, [att]: newNode.attributes[att] }), {})
  }

  const childsUpdater: ChildUpdater[] = Object.keys(newNode.childeren)
    .map<ChildUpdater>(key => {
      const oldChild = oldNode.childeren[key]
      if (oldChild == undefined) {
        return { kind: 'insert', node: newNode.childeren[key] }
      }
      return createDiff(oldChild, newNode.childeren[key])
    })

  return {
    kind: 'update',
    attributes: attUpdater,
    childeren: childsUpdater
  }
}