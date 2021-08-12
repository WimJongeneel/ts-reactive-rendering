import { VDomNode } from "./virtual_dom";
import { VDomNodeUpdater } from "./diffs";

const renderElement = (rootNode: VDomNode): HTMLElement | Text => {
  if (typeof rootNode == 'string') {
    return document.createTextNode(rootNode)
  }

  if('component' in rootNode) {
    if(rootNode.instance) {
      const elem = renderElement(rootNode.instance.render())
      rootNode.instance.notifyMounted(elem as HTMLElement)
      return elem
    }

    console.log('rendering new ' + rootNode.component.name)
    rootNode.instance = new rootNode.component()
    const vdom = rootNode.instance.initProps(rootNode.props)
    const elem= renderElement(vdom)
    rootNode.instance.notifyMounted(elem as HTMLElement)
    return elem
  }

  const elem = document.createElement(rootNode.tagname)

  for (const att in (rootNode.props || {})) {
    (elem as any)[att] = rootNode.props[att]
  }

  Object.keys((rootNode.childeren || {})).map(k => rootNode.childeren[k]).forEach(child =>
    elem.appendChild(renderElement(child))
  )

  return elem
}

export const applyUpdate = (elem: HTMLElement, updater: VDomNodeUpdater): HTMLElement => {
  
  if (updater.kind == 'skip') {
    return elem
  }

  if (updater.kind == 'replace') {
    const newElem = renderElement(updater.newNode)
    elem.replaceWith(newElem)
    return newElem as HTMLElement
  }

  if (updater.kind == 'remove') {
    elem.remove()
    return null
  }

  for (const att in updater.attributes.remove) {
    elem.removeAttribute(att)
  }

  for (const att in updater.attributes.set) {
    (elem as any)[att] = updater.attributes.set[att]
  }

  let offset = 0
  for (let i = 0; i < updater.childeren.length; i++) {
    const childUpdater = updater.childeren[i]

    if (childUpdater.kind == 'skip') {
      continue
    }

    if (childUpdater.kind == 'insert') {
      if (elem.childNodes[i + offset - 1]) {
        elem.childNodes[i + offset - 1].after(renderElement(childUpdater.node))
      } else {
        // this isn't correct if the diff starts of with insert and then remove
        elem.appendChild(renderElement(childUpdater.node))
      }
      continue
    }

    
    const childElem = elem.childNodes[i + offset]

    if(childElem == undefined) {
      console.log(elem, updater, i, offset)
    }

    if (childUpdater.kind == 'remove') {
      childElem.remove()
      offset -= 1
      continue
    }


    if (childUpdater.kind == 'replace') {
      childElem.replaceWith(renderElement(childUpdater.newNode))
      // set currentRoot
      continue;
    }


    applyUpdate(childElem as HTMLElement, childUpdater)
  }

  return elem
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