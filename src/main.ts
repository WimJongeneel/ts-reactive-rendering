import { createComponent, createElement, createText, VDomNode } from "./virtual_dom";
import { createDiff } from "./diffs";
import { renderDOM, applyUpdate } from "./render";
import { CountersComponent, CounterComponent, ToDoContainer, Component } from "./component";

// const app: VDomNode = {
//   tagname: 'div',
//   props: { 'id': 'root' },
//   childeren: {
//     h1: {
//       tagname: 'h1',
//       props: { 'class': 'header' },
//       childeren: { txt: 'hello world'}
//     },
//     xx: {
//       tagname: 'h3',
//       props: {  'class': 'header' },
//       childeren: { txt: 'h3 first'}
//     },
//     foo: {
//       tagname: 'div',
//       childeren: { txt: 'FOO' }
//     },
//     btn: {
//       tagname: 'button',
//       childeren: { txt: 'click me' },
//       props: {
//         'onclick': () => alert(1)
//       }
//     }
//   }
// }

const count: VDomNode = createComponent(CountersComponent, { key: 'root'})

const todos: VDomNode = createComponent(ToDoContainer, { key: 'root'}) 

// const app1 = createElement(
//   'div',
//   { 'id': 'root-updated' },
//   child(
//     'h3', createElement(
//       'h1',
//       { 'class': 'header' },
//       child('txt', createText('hello world - updated'))
//     )
//   ).set(
//     'xx', createElement(
//       'h3',
//       {},
//       child('txt', createText('h3 new'))
//     )
//   )
//   .set(
//     'yy', createElement(
//       'h3',
//       {},
//       child('txt', createText('h3 2nd'))
//     )
//   )
// )

// const app2 = createElement(
//   'div',
//   { 'id': 'root-updated' },
//   child(
//     'yy', createElement(
//       'b',
//       {},
//       child('txt', createText('h3 2nd'))
//     )
//   ).set(
//     'xx', createElement(
//       'h3',
//       {},
//       child('txt', createText('h3 new f'))
//     )
//   )
// )

interface HeaderComponentProps {
    title: string
}

interface HeaderComponentState {
    header: number
}

class HeaderComponent extends Component<HeaderComponentProps, HeaderComponentState> {
    state: HeaderComponentState = {
        header: 1
    }

    render() {
        return createElement(
            'h' + this.state.header, {
                key: 'h',
                onclick: () => this.setState(s => ({...s, header: s.header + 1}))
            }, 
            createText(this.props.title + ` (${this.state.header})`)
        )
    }
}

interface HeadersState {
    title: string
    headers: number
}

class Headers extends Component<{}, HeadersState> {

    state: HeadersState = {
        headers: 1,
        title: 'title'
    }

    render() {
        return createElement('root', {key: 'root'}, 
            createElement(
                'input',
                {
                    key: 'i',
                    oninput: (e: any) => this.setState(s => ({...s, title: e.target.value})),
                    value: this.state.title
                }
            ),
            createElement(
                'button',
                {
                    key: 'b',
                    onclick: () => this.setState(s => ({...s, headers: s.headers + 1}))
                },
                createText('add')
            ),
            ...Array.from({length: 10}).map((_, i) => this.state.headers > i ? createComponent(
                HeaderComponent,
                {
                    key: i.toString(),
                    title: this.state.title
                }
            ) : createElement('span', { key: i.toString()}, createText(i.toString())))
        )
    }
}


const rootElem = renderDOM('root', createComponent(Headers, {key: 'r'}))


// const diffV2 = createDiff(app, app1, true)
// console.log(diffV2)

// setTimeout(() => applyUpdate(rootElem, diffV2, rootElem), 1500)

// const diffV3 = createDiff(app1, app2, true)
// console.log(diffV3)


// setTimeout(() => applyUpdate(rootElem, diffV3, rootElem), 3000)
