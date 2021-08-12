import { createDiff, VDomNodeUpdater } from "./diffs"
import { applyUpdate } from "./render"
import { createComponent, createElement, VDomNode } from "./virtual_dom"

export abstract class Component<P, S> {
    
    protected props: P
    protected state: S
    
    private currentRootNode: VDomNode
    private mountedElement: HTMLElement
    
    protected setState(state: S) {
        if(this.mountedElement == undefined) {
            console.warn("you are updating an unmounted component")
            return
        }
        
        this.state = state
        this.update()
    }
    
    public setProps(props: P): VDomNodeUpdater {
        this.props = props
        const newRootNode = this.render()

        if(this.currentRootNode) {
            const diff = createDiff(this.currentRootNode, newRootNode)
            this.currentRootNode = newRootNode
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
        return createElement('div', {},
        {
            txt1: this.state.title,
            ip: createElement(
                'input',
                {
                    value: this.state.title,
                    oninput: (e: any) => this.setState({ title: e.target.value})
                }
                ),
                c1: createComponent(ItemComponent, { title: 'Counter 1'}),
                c2: createComponent(ItemComponent, { title: 'Counter 2'})
            }
            )
        }
        
    }
    
    export class ItemComponent extends Component<{ title: string }, { count: number }> {
        
        state = {
            count: 0
        }
        
        render(): VDomNode {
            return createElement('div', {},
            {
                txt1: this.props.title,
                hr: createElement('hr'),
                btn: createElement('button',
                { onclick: () => this.setState({count: this.state.count - 1}) },
                { txt: '-' }
                ),
                c: this.state.count.toString(),
                btn1: createElement('button',
                { onclick: () => this.setState({count: this.state.count + 1}) },
                { txt: '+' }
                )
            }
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
            if(this.state.items == 'loading') return 'loading'
            
            return createElement('div', {}, {
                top: this.state.top ? createElement('div', {}, {
                    userId: this.state.top.userId.toString(),
                    id: this.state.top.id.toString(),
                    title: this.state.top.title.toString(),
                    completed: this.state.top.completed.toString(),
                }) : createElement('div', {}, { txt: 'none'}),
                items: createElement('ul', {}, {
                    '1': createElement('li', {
                        onclick: () => this.setState({...this.state, top: this.state.items[0] as ToDo})
                    }, { txt:  this.state.items[0].title }),
                    '2': createElement('li', {
                        onclick: () => this.setState({...this.state, top: this.state.items[1] as ToDo})
                    }, { txt:  this.state.items[1].title }),
                    '3': createElement('li', {
                        onclick: () => this.setState({...this.state, top: this.state.items[2] as ToDo})
                    }, { txt:  this.state.items[2].title }),
                    '4': createElement('li', {
                        onclick: () => this.setState({...this.state, top: this.state.items[3] as ToDo})
                    }, { txt:  this.state.items[3].title }),
                })
            })
        }
    }