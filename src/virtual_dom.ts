import { Component } from './component'

export type VDOMAttributes = { [_: string]: string | number | boolean | Function }

export interface VDOMElement {
  kind: 'element'
  tagname: string
  childeren?: VDomNode[]
  props?: VDOMAttributes
  key: string | number
}

export interface VDOMComponent {
  kind: 'component'
  instance?: Component<any, any>
  props: object
  component: { new(): Component<any, any> }
  key: string | number
}

export interface VDOMText {
  kind: 'text',
  value: string
  key: string | number
}

export type VDomNode = 
| VDOMText
| VDOMElement
| VDOMComponent

export const createElement = (tagname: string, props: VDOMAttributes & { key: string | number }, ...childeren: VDomNode[]): VDOMElement => {
  const key = props.key
  delete props.key
  return ({
    kind: 'element',
    tagname,
    props,
    childeren,
    key
  })
}

export const createComponent = <P extends object>(component: { new(): Component<P, any> }, props: P & { key: string | number }): VDOMComponent => {
  const key = props.key
  delete props.key
  return ({
    component, props, key, kind: 'component'
  })  
}

export const createText = (value: string | number | boolean, key: string | number = '') : VDOMText => ({
  key, kind: 'text', value: value.toString()
})


const dom: VDomNode = {
  tagname: 'div',
  props: {
    class: 'container'
  },
  kind: 'element',
  key: '',
  childeren: [
    {
      kind: 'element',
      tagname: 'h1',
      key: '',
      childeren: [
        {
          kind: 'text',
          value: 'Hello word',
          key: ''
        }
      ]
    }
  ]
}

const elem = 
`<div class="container">
<h1>Hello word</h1>
</div>`