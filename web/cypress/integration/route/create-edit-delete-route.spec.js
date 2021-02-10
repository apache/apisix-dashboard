/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable no-undef */

context('Create and Delete Route', () => {
  const name = `routeName${new Date().valueOf()}`;
  const newName = `newName${new Date().valueOf()}`;
  const sleepTime = 100;

  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('should create route', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.contains('Create').click();
    cy.get(this.domSelector.name).type(name);
    cy.get(this.domSelector.description).type(this.data.description);

    // input request basic define
    cy.get(this.domSelector.hosts_0).type(this.data.host1);
    cy.get(this.domSelector.addHost).click();
    cy.get(this.domSelector.hosts_1).type(this.data.host2);
    cy.get(this.domSelector.remoteHost).type(this.data.host2);
    cy.get(this.domSelector.remoteAddress).click();
    cy.get(this.domSelector.address1).type(this.data.host3);
    cy.contains('Advanced Routing Matching Conditions')
      .parent()
      .siblings()
      .contains('Create')
      .click();

    // create advanced routing matching conditions
    cy.get(this.domSelector.parameterPosition).click();
    cy.contains('Cookie').click();
    cy.get(this.domSelector.ruleCard).within(() => {
      cy.get(this.domSelector.name).type('modalName');
    });
    cy.get(this.domSelector.operator).click();
    cy.contains('Equal').click();
    cy.get(this.domSelector.value).type('value');
    cy.contains('Confirm').click();

    cy.contains('Next').click();
    cy.get(this.domSelector.nodes_0_host).type(this.data.host2);
    cy.contains('Next').click();

    // redirect plugin should not display in route step3
    const nameSelector = '[data-cy-plugin-name]';
    cy.get(nameSelector).then((cards) => {
      [...cards].forEach((card) => {
        expect(card.innerText).to.not.equal('redirect');
      });
    });

    // config prometheus plugin
    cy.contains(this.domSelector.pluginCard, 'prometheus').within(() => {
      cy.get('button').first().click();
    });
    cy.contains('button', 'Cancel').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(this.data.submitSuccess);

    // back to route list page
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should edit the route', function () {
    cy.visit('/');
    cy.contains('Route').click();

    cy.get(this.domSelector.nameSelector).type(name);
    cy.contains('Search').click();
    cy.contains(name).siblings().contains('Edit').click();

    cy.get(this.domSelector.name).clear().type(newName);
    cy.get(this.domSelector.description).clear().type(this.data.description2);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(this.data.submitSuccess);
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
    cy.contains(newName).siblings().should('contain', this.data.description2);
  });

  it('should delete the route', function () {
    cy.visit('/routes/list');
    cy.get(this.domSelector.nameSelector).type(newName);
    cy.contains('Search').click();
    cy.contains(newName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', this.data.deleteRouteSuccess);
  });
});
