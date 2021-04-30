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

context('Create PluginTemplate Binding To Route', () => {
  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('should create test pluginTemplate', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(this.domSelector.empty).should('be.visible');
    cy.contains('Advanced').should('be.visible').click();
    cy.contains('Plugin Template Config').should('be.visible').click();
    cy.get(this.domSelector.empty).should('be.visible');
    cy.contains('Create').click();
    cy.get(this.domSelector.description).type(this.data.pluginTemplateName);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(this.domSelector.notification).should('contain', this.data.createPluginTemplateSuccess);

    cy.visit('/routes/list');
    cy.contains('Create').click();

    // NOTE: make sure all components rerender done
    cy.contains('Next').click().click();
    cy.get(this.domSelector.name).type(this.data.routeName);
    cy.contains('Next').click();
    cy.get(this.domSelector.nodes_0_host).type(this.data.ip1);
    cy.get(this.domSelector.nodes_0_port).clear().type(this.data.port);
    cy.get(this.domSelector.nodes_0_weight).clear().type(this.data.weight);
    cy.contains('Next').click();
    cy.contains('Custom').should('be.visible');
    cy.get(this.domSelector.customSelector).click();
    cy.contains(this.data.pluginTemplateName).click();

    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(this.data.submitSuccess);
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should delete the pluginTemplate failure', function () {
    cy.visit('plugin-template/list');
    cy.get(this.domSelector.refresh).click();

    cy.get(this.domSelector.descriptionSelector).type(this.data.pluginTemplateName);
    cy.contains('button', 'Search').click();
    cy.contains(this.data.pluginTemplateName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', this.data.pluginTemplateErrorAlert);
    cy.get(this.domSelector.notificationClose).should('be.visible').click();
  });

  it('should edit the route with pluginTemplate', function () {
    cy.visit('routes/list');

    cy.get(this.domSelector.nameSelector).type(this.data.routeName);
    cy.contains('Search').click();
    cy.contains(this.data.routeName).siblings().contains('Configure').click();

    cy.contains('Forbidden').click();
    cy.contains('Custom').click();
    cy.get(this.domSelector.redirectURIInput).clear().type('123');
    cy.get(this.domSelector.redirectCodeSelector).click();
    cy.contains('301(Permanent Redirect)').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(this.data.submitSuccess);
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should delete the pluginTemplate successfully', function () {
    cy.visit('plugin-template/list');

    cy.get(this.domSelector.refresh).click();
    cy.get(this.domSelector.descriptionSelector).type(this.data.pluginTemplateName);
    cy.contains('button', 'Search').click();
    cy.contains(this.data.pluginTemplateName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', this.data.deletePluginTemplateSuccess);

    cy.visit('/routes/list');
    cy.get(this.domSelector.nameSelector).type(this.data.routeName);
    cy.contains('Search').click();
    cy.contains(this.data.routeName).siblings().contains('More').click();
    cy.contains('Delete').should('be.visible').click();
    cy.get('.ant-modal-content').should('be.visible').within(() => {
      cy.contains('OK').click();
    });
    cy.get(this.domSelector.notification).should('contain', this.data.deleteRouteSuccess);
  });
});
