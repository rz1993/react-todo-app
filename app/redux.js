var { API } = require('./api.js')
var Redux = require('redux')

// Store
function createStore(reducer) {
  let state
  state = reducer(state, { type: null })
  let listeners = []

  // API
  const getState = () => state
  const subscribe = (listener) => {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }
  const dispatch = (action) => {
    state = reducer(state, action)
    listeners.forEach((listener) => listener())
  }

  return {
    getState,
    subscribe,
    dispatch
  }
}

// Action Definitions
const ADD_TODO = 'add-todo'
const REMOVE_TODO = 'remove-todo'
const TOGGLE_TODO = 'toggle-todo'
const ADD_GOAL = 'add-goal'
const REMOVE_GOAL = 'remove-goal'
const LOAD_STATE = 'load-state'

// Action Creators
function createGenerator() {
  let counter = 0
  return () => {
    counter = counter + 1
    return counter - 1
  }
}

const generateId = createGenerator()

// Action Creators
const addToDo = (todo) => (
  {
    type: ADD_TODO,
    todo
  }
)
const handleAddTodo = (name) => {
  return (dispatch) => {
    API.saveTodo(name)
      .then((todo) => {
        dispatch(addToDo(todo))
      }
    )
  }
}

const removeToDo = (id) => (
  {
    type: REMOVE_TODO,
    id: id
  }
)

const handleRemoveTodo = (todo) => {
  return (dispatch) => {
    // Optimistic Removal
    dispatch(removeToDo(todo.id))
    return API.deleteGoal(todo.id)
      .catch(() => {
        alert("An error occurred, could not delete todo.")
        dispatch(addToDo(todo))
      })
  }
}

const toggleToDo = (id) => (
  {
    type: TOGGLE_TODO,
    id: id
  }
)

const handleToggleTodo = (id) => {
  return (dispatch) => {
    // Optimistic Toggle
    dispatch(toggleToDo(id))
    return API.saveTodoToggle(id)
      .catch(() => dispatch(toggleToDo(id)))
  }
}

const addGoal = (goal) => (
  {
    type: ADD_GOAL,
    goal
  }
)

const handleAddGoal = (name) => {
  return (dispatch) => {
    API.saveGoal(name)
      .then((goal) => dispatch(addGoal(goal)))
  }
}

const removeGoal = (id) => (
  {
    type: REMOVE_GOAL,
    id: id
  }
)

const handleRemoveGoal = (goal) => {
  return (dispatch) => {
    dispatch(removeGoal(goal.id))
    API.deleteGoal(goal.id)
      .catch(() => {
        alert("An error occurred, could not delete goal.")
        dispatch(addGoal(goal))
      })
  }
}

const loadState = (goals, todos) => (
  {
    type: LOAD_STATE,
    goals: goals,
    todos: todos
  }
)
const fetchState = () => {
  return (dispatch) => {
    Promise.all([
      API.fetchGoals(),
      API.fetchTodos()
    ]).then(([goals, todos]) => {
      dispatch(loadState(goals, todos))
    }).catch(() => {
      alert("An error occurred in fetching the state.")
    })
  }
}

// Middleware
const thunk = (store) => (next) => (action) => {
  if (typeof action === 'function') {
    return action(store.dispatch)
  }
  return next(action)
}

const logger = (store) => (next) => (action) => {
  console.group(action.type)
  console.log("ACTION PAYLOAD: ", action)
  const result = next(action)
  console.log("New state: ", store.getState())
  console.groupEnd()
  return result
}

// Reducers
function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return state.concat([ action.todo ])
    case REMOVE_TODO:
      return state.filter((todo) => todo.id !== action.id)
    case TOGGLE_TODO:
      return state.map((todo) => (
        todo.id === action.id
          ? {
            ...todo,
            completed: !todo.completed }
          : todo
        ))
    case LOAD_STATE:
      return action.todos
    default:
      return state
  }
}

function goals(state = [], action) {
  switch (action.type) {
    case ADD_GOAL:
      return state.concat([ action.goal ])
    case REMOVE_GOAL:
      return state.filter((goal) => goal.id !== action.id)
    case LOAD_STATE:
      return action.goals
    default:
      return state
  }
}

function loader(state = true, action) {
  if (action.type === LOAD_STATE) {
    return false
  } else {
    return state
  }
}

function appReducer(state = {}, action) {
  return {
    todos: todos(state.todos, action),
    goals: goals(state.goals, action),
    loading: loader(state.loading, action)
  }
}

const store = Redux.createStore(
  appReducer,
  Redux.applyMiddleware(thunk, logger))

module.exports = {
  store,
  actionCreators: {
    handleAddTodo,
    handleRemoveTodo,
    handleToggleTodo,
    handleAddGoal,
    handleRemoveGoal,
    fetchState
  }
}
