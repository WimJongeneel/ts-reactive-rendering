import { createDiff, VDomNodeUpdater } from "./diffs"
import { applyUpdate } from "./render"
import { createComponent, createElement, createText, VDomNode } from "./virtual_dom"

export abstract class Component<P, S> {
    
    protected props: P
    protected state: S
    
    private currentRootNode: VDomNode
    private mountedElement: HTMLElement
    
    protected setState(state: S) {
        if(this.mountedElement == undefined) throw new Error("you are updating an unmounted component")
        
        this.state = state
        this.update()
    }
    
    public setProps(props: P): VDomNodeUpdater {
        this.props = props
        const newRootNode = this.render()
        
        if(this.currentRootNode) {
            const diff = createDiff(this.currentRootNode, newRootNode)
            this.currentRootNode = newRootNode
            if(diff.kind == 'replace') console.warn('replacing in setProps')
            return diff
        }
        
        throw new Error("You are setting the props of an uninitialized component")
    }
    
    public initProps(props: P): VDomNode {
        this.props = props
        this.currentRootNode = this.render()
        return this.currentRootNode
    }
    
    public update() {
        const newRootNode = this.render()
        const diff = createDiff(this.currentRootNode, newRootNode)
        if(diff.kind == 'replace') console.warn('replacing in update')
        this.currentRootNode = newRootNode
        this.mountedElement = applyUpdate(this.mountedElement, diff)
    }
    
    public notifyMounted(elem: HTMLElement) {
        this.mountedElement = elem
        this.componentDidMount()
    }
    
    public componentDidMount() {}
    
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
                    oninput: (e: any) => this.setState({ title: e.target.value}),
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
                    onclick: () => this.setState({count: this.state.count - 1}),
                    key: '-'
                    },
                    createText('-')
                ),
                createText(this.state.count),
                createElement('button', { 
                    onclick: () => this.setState({count: this.state.count + 1}),
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
            .then(items => this.setState({items}))
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
                        key: i.id,
                        onclick: () => this.setState({ ...this.state, top: i })
                    }, createText(i.title)
                )))
            )
        }
    }