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

context('Edit Service with Upstream', () => {
  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('should create a test upstream', function () {
    cy.visit('/upstream/list');
    cy.get(this.domSelector.empty).should('be.visible');
    cy.contains('Create').click();
    cy.get(this.domSelector.name).type(this.data.upstreamName);
    cy.get(this.domSelector.nodes_0_host).type(this.data.ip1);
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(this.domSelector.notification).should('contain', this.data.createUpstreamSuccess);
    cy.url().should('contains', 'upstream/list');
  });

  it('should create a test service', function () {
    cy.visit('/');
    cy.contains('Service').click();
    cy.get(this.domSelector.empty).should('be.visible');
    cy.contains('Create').click();
    cy.get(this.domSelector.name).type(this.data.serviceName);
    cy.get(this.domSelector.description).type(this.data.description);
    cy.get(this.domSelector.upstreamSelector).click();
    cy.contains(this.data.upstreamName).click();
    cy.get(this.domSelector.input).should('be.disabled');

    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(this.domSelector.notification).should('contain', this.data.createServiceSuccess);
  });

  it('should edit the service', function () {
    cy.visit('/service/list');

    cy.get(this.domSelector.nameSearch).type(this.data.serviceName);
    cy.contains('Search').click();
    cy.contains(this.data.serviceName).siblings().contains('Configure').click();

    cy.get(this.domSelector.nodes_0_host).click({ force: true }).should('value', this.data.ip1);
    cy.get(this.domSelector.input).should('be.disabled');

    cy.get(this.domSelector.upstreamSelector).click();
    cy.contains('Custom').click();
    cy.get(this.domSelector.nodes_0_host).should('not.be.disabled').clear().type(this.data.ip2);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(this.domSelector.notification).should('contain', this.data.editServiceSuccess);
  });

  it('should delete this service and upstream', function () {
    cy.visit('/service/list');
    cy.get(this.domSelector.nameSearch).type(this.data.serviceName);
    cy.contains('Search').click();
    cy.contains(this.data.serviceName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', this.data.deleteServiceSuccess);

    cy.visit('/');
    cy.contains('Upstream').click();
    cy.contains(this.data.upstreamName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', this.data.deleteUpstreamSuccess);
  });
});
