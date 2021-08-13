import { VDomNode } from "./virtual_dom";
import { ChildUpdater, VDomNodeUpdater } from "./diffs";

const renderElement = (rootNode: VDomNode): HTMLElement | Text => {
  if (rootNode.kind == 'text') {
    return document.createTextNode(rootNode.value)
  }

  if(rootNode.kind == 'component') {
    if(rootNode.instance) {
      const elem = renderElement(rootNode.instance.render())
      rootNode.instance.notifyMounted(elem as HTMLElement)
      return elem
    }

    rootNode.instance = new rootNode.component()
    const elem = renderElement( rootNode.instance.initProps(rootNode.props))
    rootNode.instance.notifyMounted(elem as HTMLElement)
    return elem
  }

  const elem = document.createElement(rootNode.tagname)

  for (const att in (rootNode.props || {})) {
    (elem as any)[att] = rootNode.props[att]
  }

  (rootNode.childeren || []).forEach(child =>
    elem.appendChild(renderElement(child))
  )

  return elem
}

export const applyUpdate = (elem: HTMLElement, diff: VDomNodeUpdater): HTMLElement => {
  if (diff.kind == 'skip') return elem 

  if (diff.kind == 'replace') {
    const newElem = renderElement(diff.newNode)
    elem.replaceWith(newElem)
    return newElem as HTMLElement
  }

  if (diff.kind == 'remove') {
    elem.remove()
    return null
  }

  for (const att in diff.attributes.remove) {
    elem.removeAttribute(att)
  }

  for (const att in diff.attributes.set) {
    (elem as any)[att] = diff.attributes.set[att]
  }

  applyChildrenDiff(elem, diff.childeren)

  return elem
}

const applyChildrenDiff = (elem: HTMLElement, operations: ChildUpdater[]) => {
  let offset = 0
  for (let i = 0; i < operations.length; i++) {
    const childUpdater = operations[i]

    if (childUpdater.kind == 'skip') continue

    if (childUpdater.kind == 'insert') {
      if (elem.childNodes[i + offset - 1]) elem.childNodes[i + offset - 1].after(renderElement(childUpdater.node))
      else elem.appendChild(renderElement(childUpdater.node))
      continue
    }
    
    const childElem = elem.childNodes[i + offset]

    if (childUpdater.kind == 'remove') {
      childElem.remove()
      offset -= 1
      continue
    }

    if (childUpdater.kind == 'replace') {
      childElem.replaceWith(renderElement(childUpdater.newNode))
      continue;
    }

    applyUpdate(childElem as HTMLElement, childUpdater)
  }
}

export const renderDOM = (htmlId: string, rootNode: VDomNode): HTMLElement => {
  const elem = document.getElementById(htmlId)
  if (elem == null) {
    throw new Error('Container elem not found')
  }

  const parent = elem.parentElement

  elem.replaceWith(renderElement(rootNode))

  return parent.children[0] as HTMLElement
}