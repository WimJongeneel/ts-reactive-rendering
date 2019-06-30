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

  /*
   * If a textnode is updated we need to replace it completly
   */
  if (oldNode.kind == 'text' || newNode.kind == 'text') {
    return { kind: 'replace', newNode }
  }

  /*
   * If the tagname of a node is changed we have to replace it completly
   */
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
  /*
   * Store all the tags of the childs that have to be removed with their presing tag
   * With this we can insert the delete updaters at the correct position
   */
  const removedTags = oldTags
    .map((t, i) => ({ prev: oldTags[i - 1], tag: t }))
    .filter(t => newChilds.has(t.tag) == false)

  let lastUpdateIndex = 0;
  let updateInSameOrder = true

  const updates: ChildUpdater[] = []

  /*
   * If we delete a tag we should also check if that tag itself is a presesor of a deleted tag
   * This happens 2 or more following tags are deleted
   */
  const deleteTagsForTag = (nc: string) => {
    const rmt = removedTags.find(t => t.prev == nc)
    if (rmt) {
      updates.push({ kind: 'delete' })
      deleteTagsForTag(rmt.tag)
    }
  }

  /*
   * If all old tags have been deleted we insert a delete updater for every one of them at the begining
   * We need this because in this case their is no presing tag to connect the deleting on
   */
  if (oldTags.length == removedTags.length) {
    oldTags.forEach(t => updates.push({ kind: 'delete' }))
  } else if (
    /*
     * Add a delete updater if the first tag was delete
     * We need this because the first tag has no presesor to connect the deleting to
     */
    removedTags[0] != undefined && removedTags[0].tag == oldTags[0]
  ) {
    updates.push({ kind: 'delete' })
  }

  newChilds.forEach((_, nc) => {
    const isNewChild = oldChilds.has(nc) == false
    /*
     * If we are pass the length of the oldChilds we have to insert everything 
     * instead of trying to produce an efficient diff
     */
    const isLonger = updates.filter(x => x.kind != 'insert').length >= oldChilds.size

    if (oldChilds.has(nc) && newChilds.has(nc) && oldTags.indexOf(nc) < lastUpdateIndex) {
      updateInSameOrder = false
    }

    /*
     * If the order of the keys that exist in both oldChilds and newChilds is different we have to 
     * replace the existing nodes (even when we could make a efficienter diff)
     * We only do this for child from the first child that is out of order
     */
    if (updateInSameOrder) {
      lastUpdateIndex = isNewChild ? lastUpdateIndex : oldTags.indexOf(nc)

      if (isNewChild || isLonger) {
        updates.push({ kind: 'insert', node: newChilds.get(nc) })
        return
      }

      updates.push(createDiff(oldChilds.get(nc), newChilds.get(nc)))
      deleteTagsForTag(nc)
      return
    }

    if (isLonger) {
      updates.push({ kind: 'insert', node: newChilds.get(nc) })
      return
    } else {
      updates.push({ kind: 'replace', newNode: newChilds.get(nc) })
      deleteTagsForTag(nc)
      return
    }
  })

  return updates
}