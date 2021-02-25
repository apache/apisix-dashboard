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

context('create and delete service ', () => {
  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('should create service', function () {
    cy.visit('/');
    cy.contains('Service').click();
    cy.contains('Create').click();

    cy.get(this.domSelector.name).type(this.data.serviceName);
    cy.get(this.domSelector.description).type(this.data.description);
    cy.get(this.domSelector.nodes_0_host).click();
    cy.get(this.domSelector.nodes_0_host).type(this.data.ip1);

    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(this.domSelector.notification).should('contain', this.data.createServiceSuccess);
  });

  it('should view the service', function () {
    cy.visit('/');
    cy.contains('Service').click();

    cy.get(this.domSelector.nameSelector).type(this.data.serviceName);
    cy.contains('Search').click();
    cy.contains(this.data.serviceName).siblings().contains('View').click();
    cy.get(this.domSelector.drawer).should('be.visible');

    cy.get(this.domSelector.codemirrorScroll).within(() => {
      cy.contains('upstream').should("exist");
      cy.contains(this.data.serviceName).should('exist');
    });
  });

  it('should edit the service', function () {
    cy.visit('/');
    cy.contains('Service').click();

    cy.get(this.domSelector.nameSelector).type(this.data.serviceName);
    cy.contains('Search').click();
    cy.contains(this.data.serviceName).siblings().contains('Edit').click();

    // Confirm whether the created data is saved.
    cy.get(this.domSelector.nodes_0_host).should('value', this.data.ip1);
    cy.get(this.domSelector.description).should('value', this.data.description)
    cy.get(this.domSelector.name).clear().type(this.data.serviceName2);
    cy.get(this.domSelector.description).clear().type(this.data.description2);
    cy.get(this.domSelector.nodes_0_host).click();
    cy.get(this.domSelector.nodes_0_host).clear().type(this.data.ip2);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(this.domSelector.notification).should('contain', this.data.editServiceSuccess);

    // test view
    cy.contains(this.data.serviceName2).siblings().contains('View').click();
    cy.get(this.domSelector.drawer).should('be.visible');

    cy.get(this.domSelector.codemirrorScroll).within(() => {
      cy.contains('upstream').should('exist');
      cy.contains(this.data.serviceName2).should('exist');
    });
  });

  it('should delete the service', function () {
    // Confirm whether the edited data is saved.
    cy.visit('/service/list');
    cy.get(this.domSelector.nameSelector).type(this.data.serviceName2);
    cy.contains('Search').click();
    cy.contains(this.data.serviceName2).siblings().contains('Edit').click();
    cy.get(this.domSelector.nodes_0_host).should('value', this.data.ip2);
    cy.get(this.domSelector.description).should('value', this.data.description2);

    cy.visit('/');
    cy.contains('Service').click();
    cy.contains(this.data.serviceName2).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', this.data.deleteServiceSuccess);
  });
});

