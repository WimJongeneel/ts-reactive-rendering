import { VDomNode } from "./virtual_dom";
import { VDomNodeUpdater } from "./diffs";

const renderElement = (rootNode: VDomNode): HTMLElement | Text => {
  if (rootNode.kind == 'text') {
    return document.createTextNode(rootNode.text)
  }

  const elem = document.createElement(rootNode.tagname)

  for (const att in rootNode.attributes) {
    elem.setAttribute(att, rootNode.attributes[att].toString())
  }

  for (const child in rootNode.childeren) {
    elem.appendChild(renderElement(rootNode.childeren[child]))
  }

  return elem
}

export const applyUpdate = (elem: HTMLElement, updater: VDomNodeUpdater): void => {
  if (updater.kind == 'replace') {
    elem.replaceWith(renderElement(updater.newNode))
    return
  }

  if (updater.kind == 'delete') {
    elem.remove()
    return
  }

  if (updater.kind == 'skip') {
    return
  }

  for (const att in updater.attributes.delete) {
    elem.removeAttribute(att)
  }

  for (const att in updater.attributes.set) {
    elem.setAttribute(att, updater.attributes.set[att].toString())
  }

  let insertCount = 0
  for (let i = 0; i < updater.childeren.length; i++) {
    const childElem = elem.childNodes[i + insertCount]
    const childUpdater = updater.childeren[i]

    if (childUpdater.kind == 'skip') {
      continue
    }

    if (childUpdater.kind == 'delete') {
      childElem.remove()
      insertCount -= 1
      continue
    }

    if (childUpdater.kind == 'insert') {
      childElem.before(renderElement(childUpdater.node))
      insertCount += 1
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