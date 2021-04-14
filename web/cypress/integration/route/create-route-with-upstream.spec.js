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

context('Create Route with Upstream', () => {
  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('should create an upstream', function () {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains('Create').click();

    cy.get(this.domSelector.name).type(this.data.upstreamName);
    cy.get(this.domSelector.description).type(this.data.description);
    cy.get(this.domSelector.nodes_0_host).type(this.data.host1);
    cy.contains('Next').click();
    cy.contains('Submit').click();
  });

  it('should create route with upstream just created', function () {
    cy.visit('/');
    cy.get('[role=menu]').should('be.visible').within(() => {
      cy.contains('Route').click();
    });
    cy.contains('Create').click();

    cy.contains('Next').click().click();
    cy.get(this.domSelector.name).type(this.data.routeName);
    cy.contains('Next').click();
    // should disable Upstream input boxes after selecting an existing upstream
    cy.get(this.domSelector.upstreamSelector).click();
    cy.contains(this.data.upstreamName).click();
    cy.get(this.domSelector.input).should('be.disabled');
    // should enable Upstream input boxes after selecting Custom mode
    cy.get(this.domSelector.upstreamSelector).click();
    cy.contains('Custom').click();
    cy.get(this.domSelector.input).should('not.be.disabled');

    cy.get(this.domSelector.nodes_0_host).clear().type(this.data.ip1);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(this.data.submitSuccess).should('be.visible');
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should edit this route with upstream', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(this.domSelector.nameSelector).type(this.data.routeName);

    cy.contains('Search').click();
    cy.contains(this.data.routeName).siblings().contains('Configure').click();

    cy.get(this.domSelector.name).should('value', this.data.routeName);
    cy.contains('Next').click({ force: true });

    // check if the changes have been saved
    cy.get(this.domSelector.nodes_0_host).should('value', this.data.ip1);

    cy.get(this.domSelector.upstreamSelector).click();
    cy.contains(this.data.upstreamName).click();
    cy.get(this.domSelector.input).should('be.disabled');

    cy.contains(this.data.upstreamName).click();
    cy.contains('Custom').click();
    cy.get(this.domSelector.input).should('not.be.disabled');

    cy.get(this.domSelector.nodes_0_host).clear().type(this.data.ip2);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(this.data.submitSuccess).should('be.visible');
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');

    // check if the changes have been saved
    cy.get(this.domSelector.nameSelector).type(this.data.routeName);
    cy.contains('Search').click();

    cy.contains(this.data.routeName).siblings().contains('Configure').click();
    // ensure it has already changed to edit page
    cy.get(this.domSelector.name).should('value', this.data.routeName);
    cy.contains('Next').click({ force: true });
    cy.get(this.domSelector.nodes_0_host).should('value', this.data.ip2);
  });

  it('should delete this test route and upstream', function () {
    cy.visit('/routes/list');
    cy.get(this.domSelector.nameSelector).type(this.data.routeName);
    cy.contains('Search').click();
    cy.contains(this.data.routeName).siblings().contains('More').click();
    cy.contains('Delete').click();
    cy.get(this.domSelector.deleteAlert).should('be.visible').within(() => {
      cy.contains('OK').click();
    });
    cy.get(this.domSelector.notification).should('contain', this.data.deleteRouteSuccess);

    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains(this.data.upstreamName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should(
      'contain',
      this.data.deleteUpstreamSuccess,
    );
  });
});
