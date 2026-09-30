/// <reference types="cypress" />

describe('Login no hub de leitura', () => {

  beforeEach(() => {
    cy.visit('login.html')
    cy.setCookie('jwt_education_shown', 'true')
  });

  it('Deve fazer login com sucesso com usuário comum - usando comando customizado', () => {
    cy.login('usuario@teste.com', 'user123')
    cy.get('h4').should('contain', 'Olá')
  })

  it('Deve fazer login com sucesso com usuário admin - usando comando customizado', () => {
    cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_SENHA'))
    cy.get('h1').should('contain', 'Painel Administrativo')
  })

  it('Deve fazer login com sucesso com usuário comum - via api', () => {
    cy.request({
      method: 'POST',
      url: 'api/login',
      body: {
        email: 'usuario@teste.com',
        password: 'user123'
      }
    }).then((response) => {
      expect(response.status).to.eq(200)

      window.localStorage.setItem('authToken', response.body.token)
      window.localStorage.setItem('isAdmin', false)
      window.localStorage.setItem('userId', response.body.id)
      window.localStorage.setItem('userName', 'Sabine')

      cy.visit('dashboard.html')
      cy.get('h4').should('contain', 'Olá')
    })
  })

  it('Deve fazer login com sucesso com usuário comum - setando o token', () => {
    const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c3VhcmlvQHRlc3RlLmNvbSIsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE3OTA2MDUxNzgsImV4cCI6MTc5MDYzMzk3OH0.2uJH4vJt1agMX_x6GmuBRJHPsnCzC_QcMsQhT5A1SSU'
    window.localStorage.setItem('authToken', token)

    cy.visit('dashboard.html')
    cy.get('h4').should('contain', 'Olá')
  })

  it('Deve fazer login com sucesso com usuário comum - usando intercept', () => {
    cy.intercept('POST', 'api/login',
      {
        statusCode: 200,
        body: {
          token: 'token123',
          name: 'Usuário de teste'
        }
      }).as('loginMock')

    cy.login('usuario@usuario.com', 'testeuser123')
    cy.wait('@loginMock')
    cy.get('h4').should('contain', 'Olá')

  })

  it('Deve simular um erro do servidor - usando intercept', () => {
    cy.intercept('POST', 'api/login', {
      statusCode: 500
    }).as('erroServer')
    cy.loginErro('usuario@teste.com', 'user123')
    cy.wait('@erroServer')
    cy.get('#alert-container').should('contain', 'Erro de conexão. Tente novamente.')
  });

  it('Deve simular um erro do cliente - usando intercept', () => {
    cy.intercept('POST', 'api/login', {
      statusCode: 400, body: { erro: 'erro do cliente' }
    }).as('erroClient')
    cy.login('usuario@teste.com', 'user123', false)
    cy.wait('@erroClient')
    cy.get('#alert-container').should('contain', 'Erro ao fazer login')
  });

})