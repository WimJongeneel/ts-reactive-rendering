export type VDOMAttributes = { [_: string]: string | number | boolean }

export interface VDOMElement {
  kind: 'elem'
  tagname: string
  attributes: VDOMAttributes
  childeren: Map<string, VDomNode>
}

export interface VDOMTextNode {
  kind: 'text',
  text: string
}

export type VDomNode = 
  | VDOMTextNode
  | VDOMElement

export const createElement = (tagname: string, attributes: VDOMAttributes = {}, childeren: Map<string, VDomNode> = new Map()): VDOMElement => ({
  kind: 'elem',
  tagname,
  attributes,
  childeren
})

export const createText = (text: string): VDOMTextNode => ({
  kind: 'text',
  text
})

export const child = (tagname: string, elem: VDomNode) => createEmptyChildsMap().set(tagname, elem)

export const createEmptyChildsMap = () => new Map<string, VDomNode>()