
describe('R8 To-do item GUI tests', () => {
  let uid
  let name
  let email
  let taskTitle
  let taskUrl
  let todoText

  before(() => {
    cy.fixture('user.json').then((user) => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:5000/users/create',
        form: true,
        body: user
      }).then((response) => {
        uid = response.body._id.$oid
        name = `${user.firstName} ${user.lastName}`
        email = user.email

        cy.fixture('task.json').then((task) => {
          taskTitle = task.title
          taskUrl = task.url
          todoText = task.todos

          cy.request({
            method: 'POST',
            url: 'http://localhost:5000/tasks/create',
            form: true,
            body: {
              title: task.title,
              description: task.description,
              url: taskUrl,
              userid: uid,
              todos: todoText
            }
          })
        })
      })
    })
  })

  beforeEach(() => {
    cy.visit('http://localhost:3000')

    cy.contains('div', 'Email Address')
      .find('input[type="text"]')
      .type(email)

    cy.get('form').submit()

    cy.get('h1')
      .should('contain.text', `Your tasks, ${name}`)

    cy.contains(taskTitle).click()
  })

  // R8UC1: Create a to-do item

  it('TC-R8UC1-1 creates a to-do item with a description', () => {
    const newTodo = `Cypress created todo ${Date.now()}`

    cy.get('input[placeholder="Add a new todo item"]')
      .should('be.visible')
      .type(newTodo)

    cy.get('input[type="submit"][value="Add"]')
      .should('be.enabled')
      .click()

    cy.contains('li.todo-item', newTodo)
      .should('be.visible')
  })

  it('TC-R8UC1-2 prevents adding a to-do item with an empty description', () => {
    cy.get('li.todo-item').then(($items) => {
      const initialCount = $items.length

      // The input should be empty when the task view opens.
      // Do not call clear(): Cypress reported that the field was hidden.
      cy.get('input[placeholder="Add a new todo item"]')
        .should('have.value', '')

      cy.get('input[type="submit"][value="Add"]')
        .should('be.disabled')

      cy.get('li.todo-item')
        .should('have.length', initialCount)
    })
  })

  // R8UC2: Toggle a to-do item's status

  it('TC-R8UC2-1 toggles an active to-do item to done', () => {
    cy.contains('li.todo-item', todoText)
      .should('be.visible')
      .find('span.checker')
      .then(($checker) => {
        // Ensure the item starts in the active state.
        if ($checker.hasClass('checked')) {
          cy.wrap($checker).click()
        }
      })

    cy.contains('li.todo-item', todoText)
      .find('span.checker')
      .should('not.have.class', 'checked')
      .click()

    cy.contains('li.todo-item', todoText)
      .find('span.checker')
      .should('have.class', 'checked')
  })

  it('TC-R8UC2-2 toggles a done to-do item back to active', () => {
    cy.contains('li.todo-item', todoText)
      .should('be.visible')
      .find('span.checker')
      .then(($checker) => {
        // Ensure the item starts in the done state.
        if (!$checker.hasClass('checked')) {
          cy.wrap($checker).click()
        }
      })

    cy.contains('li.todo-item', todoText)
      .find('span.checker')
      .should('have.class', 'checked')
      .click()

    cy.contains('li.todo-item', todoText)
      .find('span.checker')
      .should('not.have.class', 'checked')
  })

  // R8UC3: Delete a to-do item

  it('TC-R8UC3-1 deletes an existing to-do item', () => {
    cy.contains('li.todo-item', todoText)
      .should('be.visible')
      .find('span.remover')
      .click()

    cy.contains('li.todo-item', todoText)
      .should('not.exist')
  })

  after(() => {
    if (uid) {
      cy.request({
        method: 'DELETE',
        url: `http://localhost:5000/users/${uid}`
      })
    }
  })
})
