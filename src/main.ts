import { createComponent, createElement, createText, VDomNode } from "./virtual_dom";
import { renderDOM, applyUpdate } from "./render";
import { Component } from "./component";

interface NewItemFormState {
    name: string
}

interface NewItemFormProps {
    addItem: (name: string) => void
}

class NewItemForm extends Component<NewItemFormProps, NewItemFormState> {

    state = { name: '' }

    render() {
        return createElement(
            'form',
            { key: 'f',
              onsubmit: (e: Event) => {
                e.preventDefault()
                this.props.addItem(this.state.name)
                this.setState(() => ({ name: '' }))
              }
            },
            createElement('label', { key: 'l-n', 'for': 'i-n' }, createText('New item')),
            createElement('input',
                { key: 'i-n', id: 'i-n', 
                  value: this.state.name,
                  oninput: (e: any) => this.setState(s => ({...s, name: e.target.value})) }
            ),
        )
    }
}

interface ToDoItem {
    name: string
    done: boolean
}

interface ToDoState {
    items: ToDoItem[]
}

class ToDoComponent extends Component<{}, ToDoState> {

    state: ToDoState = { items: [] }

    toggleItem(index: number) {
        this.setState(s => ({items: s.items.map((item, i) => {
            if(index == i) return { ...item, done: !item.done }
            return item
        })}))
    }

    render() {
        return createElement('div', { key: 'root'},
            createComponent(NewItemForm, {
                key: 'form',
                addItem: n => this.setState(s => ({ items: s.items.concat([{name: n, done: false}])}))
            }),
            createElement('ul', { key: 'items' }, 
                ...this.state.items.map((item: ToDoItem, i) => 
                    createElement( 'li', { key: i.toString()},
                        createElement('button', { 
                                key: 'btn',
                                onclick: () => this.toggleItem(i)
                            }, 
                            createText(item.done ? 'done' : '-')),
                        createText(item.name, 'label')
                ))
            )
        )
    }
}

renderDOM('root', createComponent(ToDoComponent, {key: 'root'}))

