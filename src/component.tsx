import { createDiff, VDomNodeUpdater } from "./diffs"
import { applyUpdate } from "./render"
import { createComponent, createElement, createText, VDomNode } from "./virtual_dom"

export abstract class Component<P, S> {
    
    protected props: P
    protected state: S
    
    private currentRootNode: VDomNode
    private mountedElement: HTMLElement | Text
    
    protected setState(updater: (s:S) => S) {
        if(this.mountedElement == undefined) throw new Error("you are updating an unmounted component")
        this.state = updater(this.state)
        applyUpdate(this.mountedElement, this.getUpdateDiff())
    }
    
    public setProps(props: P): VDomNodeUpdater {
        if(this.mountedElement == null)
            throw new Error("You are setting the props of an inmounted component")
        
        // include in article?
        this.state = this.componentWillRecieveProps(props, this.state)
        this.props = props
        return this.getUpdateDiff()
    }
    
    public initProps(props: P): VDomNode {
        this.props = props
        this.currentRootNode = this.render()
        return this.currentRootNode
    }
    
    private getUpdateDiff() : VDomNodeUpdater {
        const newRootNode = this.render()
        const diff = createDiff(this.currentRootNode, newRootNode)
        if(diff.kind == 'replace') {
            diff.callback = elem => this.mountedElement = elem
        }
        this.currentRootNode = newRootNode
        return diff
    }
    
    public notifyMounted(elem: HTMLElement | Text) {
        this.mountedElement = elem
        setTimeout(() => this.componentDidMount())
    }

    public unmount() {
        this.mountedElement = null
        this.componentWillUnmount()
    }
    
    public componentDidMount() {}

    public componentWillUnmount() {}

    // include in article?
    public componentWillRecieveProps(props: P, state: S): S { return state }
    
    public abstract render(): VDomNode
}

export class CountersComponent extends Component<{}, { title: string }> {
    
    state = {
        title: 'Title'
    }
    
    render(): VDomNode {
        return createElement('div', { key: 'div'},
            createText(this.state.title, 'title'),
            createElement(
                'input',
                {
                    value: this.state.title,
                    oninput: (e: any) => this.setState(s => ({ title: e.target.value})),
                    key: 'input'
                },
                ),
                createComponent(CounterComponent, { title: 'Counter 1', key: 'c1'}),
                createComponent(CounterComponent, { title: 'Counter 2', key: 'c2'})
            )
        }
        
    }
    
    export class CounterComponent extends Component<{ title: string }, { count: number }> {
        
        state = {
            count: 0
        }
        
        render(): VDomNode {
            return createElement('div', { key: 'root' },
                createText(this.props.title, 'title'),
                createElement('hr', { key: 'hr' }),
                createElement('button', {
                    onclick: () => this.setState(s => ({count: this.state.count - 1})),
                    key: '-'
                    },
                    createText('-')
                ),
                createText(this.state.count),
                createElement('button', { 
                    onclick: () => this.setState(s => ({count: this.state.count + 1})),
                    key: '+'
                    },
                    createText('+')
                )
            )
        }
    }
    
    interface ToDo {
        "userId": number,
        "id": number,
        "title": string,
        "completed": boolean
    }
    
    interface ToDoState {
        items: 'loading' | ToDo[]
        top?: ToDo 
    }
    
    export class ToDoContainer extends Component<{}, ToDoState> {
        
        state: ToDoState = {
            items: 'loading'
        }
        
        componentDidMount() {
            fetch("https://jsonplaceholder.typicode.com/todos")
            .then(res => res.json())
            .then(items => this.setState(s => ({items})))
        }
        
        render() {
            if(this.state.items == 'loading') return createText('loading')
            
            return createElement('div', {key: 'div'},
                this.state.top ? createElement('div', { key: 'top' },
                    createText(this.state.top.userId.toString(), 'u-i'),
                    createText(this.state.top.id.toString(), 'id'),
                    createText(this.state.top.title.toString(), 't'),
                    createText(this.state.top.completed.toString(), 'c')
                ) : createText('none', 'top'),
                createElement('ul', { key: 'items'}, ...this.state.items.map(i => createElement(
                    'li', { 
                        key: i.id.toString(),
                        onclick: () => this.setState(s => ({ ...s, top: i }))
                    }, createText(i.title)
                )))
            )
        }
    }