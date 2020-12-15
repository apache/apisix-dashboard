/* eslint-disable no-undef */
context('Login Test', () => {
  it('login failed with empty username and password', () => {
    cy.visit('/user/Login');
    cy.contains('Login').click();
    cy.get('.ant-form-item-explain').should('contain', 'Please input username');
    cy.get('.ant-form-item-explain').should('contain', 'Please input password');
  });


  it('login success', () => {
    cy.visit('/user/Login');
    cy.get('#control-ref_username').type('user');
    cy.get('#control-ref_password').type('user');
    cy.contains('Login').click();
  });
})
