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

  const childsUpdater: ChildUpdater[] = childsDiff(oldNode.childeren, newNode.childeren)

  return {
    kind: 'update',
    attributes: attUpdater,
    childeren: childsUpdater
  }
}

const childsDiff = (oldChilds: Map<string, VDomNode>, newChilds: Map<string, VDomNode>): ChildUpdater[] => {
  const oldTags = Array.from(oldChilds.keys())

  let lastUpdateIndex = 0;
  let updateInSameOrder = true

  const updates: ChildUpdater[] = []

  newChilds.forEach((_, nc) => {
    const isNewChild = oldChilds.has(nc) == false
    const isLonger = updates.filter(x => x.kind != 'insert').length >= oldChilds.size

    if (oldChilds.has(nc) && newChilds.has(nc) && oldTags.indexOf(nc) < lastUpdateIndex) {
      updateInSameOrder = false
    }

    if (updateInSameOrder) {
      lastUpdateIndex = isNewChild ? lastUpdateIndex : oldTags.indexOf(nc)

      if (isNewChild) {
        updates.push({ kind: 'insert', node: newChilds.get(nc) })
        return
      }

      if (isLonger) {
        updates.push({ kind: 'insert', node: newChilds.get(nc) })
        return
      }

      updates.push(createDiff(oldChilds.get(nc), newChilds.get(nc)))
      return
    }

    if (isLonger) {
      updates.push({ kind: 'insert', node: newChilds.get(nc) })
      return
    } else {
      updates.push({ kind: 'replace', newNode: newChilds.get(nc) })
      return
    }
  })

  return updates
}