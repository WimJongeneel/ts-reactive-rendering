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

  rootNode.childeren.forEach(child =>
    elem.appendChild(renderElement(child))
  )

  return elem
}

export const applyUpdate = (elem: HTMLElement, updater: VDomNodeUpdater, parent: HTMLElement): void => {
  if (updater.kind == 'skip') {
    return
  }

  if (updater.kind == 'replace') {
    elem.replaceWith(renderElement(updater.newNode))
    return
  }

  if (updater.kind == 'remove') {
    elem.remove()
    return
  }

  for (const att in updater.attributes.remove) {
    elem.removeAttribute(att)
  }

  for (const att in updater.attributes.set) {
    elem.setAttribute(att, updater.attributes.set[att].toString())
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
        parent.appendChild(renderElement(childUpdater.node))
      }
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

    applyUpdate(childElem as HTMLElement, childUpdater, elem)
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