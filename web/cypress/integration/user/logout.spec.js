/* eslint-disable no-undef */
context('Logout Test', () => {
  beforeEach(() => {
    cy.login();
  });

  it('logout', () => {
    cy.visit('/');
    cy.contains('.anticon', 'APISIX User', {
      matchCase: false
    }).click({
      force: true
    });
    cy.contains('退出').click();
    cy.url().should('contains', '/user/login');
  });
})
