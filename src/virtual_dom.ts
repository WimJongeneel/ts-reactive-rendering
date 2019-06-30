export type VDomNode = {
  kind: 'elem'
  tagname: string
  attributes: { [_: string]: string | number | boolean }
  childeren: Map<string, VDomNode>
} | {
  kind: 'text',
  text: string
}

export const createElement = (tagname: string, attributes: { [_: string]: string | number | boolean } = {}, childeren: Map<string, VDomNode> = new Map()): VDomNode => ({
  kind: 'elem',
  tagname,
  attributes,
  childeren
})

export const createText = (text: string): VDomNode => ({
  kind: 'text',
  text
})

export const createEmptyChildsMap = () => new Map<string, VDomNode>()