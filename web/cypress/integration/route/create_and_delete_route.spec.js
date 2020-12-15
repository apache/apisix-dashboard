/* eslint-disable no-undef */
/// <reference types="cypress" />

context('Create and Delete Route', () => {
  const root_name = `root_${new Date().valueOf()}`

  beforeEach(() => {
    // init login 
    cy.login();
  })

  it('create route', () => {
    //  go to route create page
    cy.visit('/routes/create');
    cy.contains('Route').click();
    cy.contains('Create').click();

    // input Name And Description
    cy.get('#name').type(root_name);
    cy.get('#desc').type('desc');

    // input Request Basic Define
    cy.get('#hosts_0').type('11.11.11.11');
    cy.contains('Domain Name').parent().parent().parent().contains(' Create').click();
    cy.get('#hosts_1').type('12.12.12.12');
    cy.get('#remote_addrs_0').type('12.12.12.12');
    cy.contains('Remote Addrs').parent().parent().parent().contains(' Create').click();
    cy.get('#remote_addrs_1').type('10.10.10.10');
    cy.contains('Advanced Routing Matching Conditions').parent().siblings().contains('Create').click();

    // create rule 
    cy.get('#position').click();
    cy.contains('Cookie').click();
    cy.get('.ant-modal').within(() => {
      cy.get('#name').type('modalName');
    })
    cy.get('#operator').click();
    cy.contains('Equal').click();
    cy.get('#value').type('value');
    cy.contains('Confirm').click();

    // go to step2
    cy.contains('Next').click();
    cy.wait(400)
    cy.get('#nodes_0_host').type('12.12.12.12', {
      timeout: 4000
    });

    // go to step3
    cy.contains('Next').click();

    // config prometheus plugin
    cy.contains('.ant-card', 'prometheus').get('button').first().click();
    cy.contains('button','Cancel').click();
    cy.debug();

    // go to step4
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains('SubmitSuccessfully');

    // back to route list page
    cy.contains('Return Route List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('delete the route', () => {
    cy.visit('/routes/list')
    cy.contains(root_name).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get('.ant-notification-notice-message').should('contain', 'Delete Route Successfully')
  })
})
