import { VDOMAttributes, VDomNode } from "./virtual_dom";

type AttributesUpdater = {
  set: VDOMAttributes
  remove: string[]
}

interface InsertOperation {
  kind: 'insert', node: VDomNode
}

interface UpdateOperation {
  kind: 'update',
  attributes: AttributesUpdater,
  childeren: ChildUpdater[]
}

interface ReplaceOperation {
  kind: 'replace',
  newNode: VDomNode
}

interface RemoveOperation {
  kind: 'remove'
}

interface SkipOperation {
  kind: 'skip'
}

export type VDomNodeUpdater = 
  | UpdateOperation
  | ReplaceOperation
  | RemoveOperation
  | SkipOperation
  
export type ChildUpdater =
  | UpdateOperation
  | ReplaceOperation
  | RemoveOperation
  | SkipOperation
  | InsertOperation

const skip = (): SkipOperation => ({ kind: 'skip' })

const replace = (newNode: VDomNode): ReplaceOperation => ({ kind: 'replace', newNode })

const update = (attributes: AttributesUpdater, childeren: ChildUpdater[]): UpdateOperation => ({ 
   kind: 'update',
   attributes,
   childeren
})

const remove = (): RemoveOperation => ({ kind: 'remove' })

const insert = (node: VDomNode): InsertOperation => ({ kind: 'insert', node })

export const createDiff = (oldNode: VDomNode, newNode: VDomNode, usev2 = false): VDomNodeUpdater => {
  if (typeof oldNode == 'string' && typeof newNode == 'string' && oldNode == newNode) {
    return skip()
  }

  // If a textnode is updated we need to replace it completly
  if (typeof oldNode == 'string' || typeof newNode == 'string') {
    return replace(newNode)
  }

  if('component' in oldNode && 'component' in newNode && oldNode.component == newNode.component && oldNode.instance) {
    newNode.instance = oldNode.instance
    return newNode.instance.setProps(newNode.props)
  }

  if('component' in oldNode || 'component' in newNode) {
    if('component' in oldNode) return replace(newNode)
    if('component' in newNode) {
      console.log('new component ' + newNode.component.name, oldNode)
      newNode.instance = new newNode.component()
      return { kind: 'replace', newNode: newNode.instance.initProps(newNode.props) }
    }
  }

  /*
   * If the tagname of a node is changed we have to replace it completly
   */
  if (oldNode.tagname != oldNode.tagname) {
    return replace(newNode)
  }

  const attUpdater: AttributesUpdater = {
    remove: Object.keys(oldNode.props || {})
      .filter(att => Object.keys(newNode).indexOf(att) == -1),
    set: Object.keys(newNode.props || {})
      .filter(att => oldNode.props[att] != newNode.props[att])
      .reduce((upd, att) => ({ ...upd, [att]: newNode.props[att] }), {})
  }

  const childsUpdater: ChildUpdater[] = childsDiff2((oldNode.childeren || {}), (newNode.childeren || {}))

  return update(attUpdater, childsUpdater)
}

const childsDiff2 = (oldChilds: { [_: string]: VDomNode }, newChilds: { [_: string]: VDomNode }): ChildUpdater[] => {
  const remainingOldChilds: [string, VDomNode][] = Object.keys(oldChilds).map(k => [ k, oldChilds[k] ])
  const remainingNewChilds: [string, VDomNode][] = Object.keys(newChilds).map(k => [ k, newChilds[k] ])

  const operations: ChildUpdater[] = []

  // find the first element that got updated
  let [ nextUpdateKey ] = remainingOldChilds.find(k => remainingNewChilds.map(k => k[0]).indexOf(k[0]) != -1) || [null]

  while(nextUpdateKey) {

    // first remove all old childs before the update
    while(remainingOldChilds[0] && remainingOldChilds[0][0] != nextUpdateKey) {
      operations.push(remove())
      remainingOldChilds.shift()
    }

    // then insert all new childs before the update
    while(remainingNewChilds[0] && remainingNewChilds[0][0] != nextUpdateKey) {
      operations.push(insert(remainingNewChilds.shift()[1]))
    }

    // create the update
    operations.push(createDiff(remainingOldChilds.shift()[1], remainingNewChilds.shift()[1]))

    // find the next update
    ; [ nextUpdateKey ] = remainingOldChilds.find(k => remainingNewChilds.map(k => k[0]).indexOf(k[0]) != -1) || [null]
  }

  // remove all remaing old childs after the last update
  while(remainingOldChilds.length > 0) {
    operations.push(remove())
    remainingOldChilds.shift()
  }

  // insert all remaing new childs after the last update
  while(remainingNewChilds[0]) operations.push(insert(remainingNewChilds.shift()[1]))

  return operations
}