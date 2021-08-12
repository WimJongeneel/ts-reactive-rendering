import { Component } from './component'

export type VDOMAttributes = { [_: string]: string | number | boolean | Function }

export interface VDOMElement {
  tagname: string
  childeren?: { [_: string]: VDomNode }
  props?: VDOMAttributes
}

export interface VDOMComponent {
  instance?: Component<any, any>
  props: object
  component: { new(): Component<any, any> }
}

export type VDomNode = 
  | string
  | VDOMElement
  | VDOMComponent



export const createElement = (tagname: string, props: VDOMAttributes = {}, childeren: { [_: string]: VDomNode } = {}): VDOMElement => ({
  tagname,
  props,
  childeren
})

export const createComponent = <P extends object>(component: { new(): Component<P, any> }, props: P): VDOMComponent => ({
  component,
  props
})

// export const createText = (text: string): VDOMTextNode => ({
//   kind: 'text',
//   text
// })

// export const child = (tagname: string, elem: VDomNode) => createEmptyChildsMap().set(tagname, elem)

// export const createEmptyChildsMap = () => new Map<string, VDomNode>()