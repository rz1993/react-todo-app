var React = require('react')
var ReactDOM = require('react-dom')
var { store, actionCreators } = require('./redux.js')
var { handleAddTodo,
  handleRemoveTodo,
  handleToggleTodo,
  handleAddGoal,
  handleRemoveGoal,
  fetchState } = actionCreators

function List(props) {
  const { items } = props
  return (
    <ul>
      { items.map((item) => (
        <li
          key={ item.id }>
          <span
            onClick={ () => props.toggleItem && props.toggleItem(item.id) }>
            { item.name }
          </span>
          <button
            onClick={ () => props.removeItem(item) }>
            X
          </button>
        </li>
      ))}
    </ul>
  )
}

class ToDos extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      text: ""
    }
    this.removeToDo = this.removeToDo.bind(this)
    this.toggleToDo = this.toggleToDo.bind(this)
  }
  addToDo(name) {
    this.props.store.dispatch(handleAddTodo(name))
    this.setState({
      text: ""
    })
  }
  removeToDo(todo) {
    this.props.store.dispatch(handleRemoveTodo(todo))
  }
  toggleToDo(id) {
    this.props.store.dispatch(handleToggleTodo(id))
  }
  onChange(textInput) {
    this.setState({ text: textInput })
  }
  render() {
    const { todos } = this.props
    return (
      <div>
        <h3>This ya Todos boi</h3>
        <input
          id="todo-input"
          type="text"
          placeholder="Add a todo"
          value={ this.state.text }
          onChange={ (e) => this.onChange(e.target.value) } />
        <button
          onClick={ () => this.handleAddTodo(this.state.text) }>
          Add
        </button>
        <List
          items={ todos }
          removeItem={ this.removeToDo }
          toggleItem={ this.toggleToDo } />
      </div>
    )
  }
}

class Goals extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      text: ""
    }
    this.removeGoal = this.removeGoal.bind(this)
  }
  addGoal(name) {
    this.props.store.dispatch(handleAddGoal(name))
    this.setState({
      text: ""
    })
  }
  removeGoal(goal) {
    this.props.store.dispatch(handleRemoveGoal(goal))
  }
  onChange(textInput) {
    this.setState({ text: textInput })
  }
  render() {
    const { goals } = this.props
    return (
      <div>
        <h3>This ya Goals boi</h3>
        <input
          id="goal-input"
          type="text"
          placeholder="Add a goal"
          value={ this.state.text }
          onChange={ (e) => this.onChange(e.target.value) } />
        <button
          onClick={ () => this.addGoal(this.state.text) }>
          Add
        </button>
        <List
          items={ goals }
          removeItem={ this.removeGoal } />
      </div>
    )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.props.store.subscribe(() => this.forceUpdate())
    this.props.store.dispatch(fetchState())
  }
  render() {
    const state = this.props.store.getState()
    const { todos, goals, loading } = state
    if (loading) {
      return <h1>Loading</h1>
    }
    return (
      <div>
        <h1>Hello World, Its me Ya Boi</h1>
        <ToDos
          store={ store }
          todos={ todos } />
        <Goals
          store={ store }
          goals={ goals } />
      </div>
    )
  }
}

ReactDOM.render(
  <App store={ store } />,
  document.getElementById('app')
)
