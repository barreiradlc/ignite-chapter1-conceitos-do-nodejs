const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  request.user = user;

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.find(user => user.username === username);

  if (userAlreadyExists) return response.status(400).json({ error: "Username already registered" })

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: deadline,
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user, body, params } = request
  const { title, deadline } = body
  const { id } = params

  let todo = user.todos.find(todo => todo.id === id)

  if (!todo) return response.status(404).json({ error: "Todo not found" })

  todo = {
    ...todo,
    title,
    deadline,
  }

  const otherTodos = user.todos.filter(todo => todo.id !== id)

  user.todos = [
    ...otherTodos,
    todo
  ]

  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user, params } = request
  const { id } = params

  let todo = user.todos.find(todo => todo.id === id)

  if (!todo) return response.status(404).json({ error: "Todo not found" })

  todo = {
    ...todo,
    done: true
  }

  const otherTodos = user.todos.filter(todo => todo.id !== id)

  user.todos = [
    ...otherTodos,
    todo
  ]

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user, params } = request
  const { id } = params

  let todo = user.todos.find(todo => todo.id === id)

  if (!todo) return response.status(404).json({ error: "Todo not found" })

  const otherTodos = user.todos.filter(todo => todo.id !== id)

  user.todos = otherTodos

  return response.status(204).send()
});

module.exports = app;