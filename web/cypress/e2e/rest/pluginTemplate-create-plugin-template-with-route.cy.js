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
  const selector = {
    empty: '.ant-empty-normal',
    description: '#desc',
    notification: '.ant-notification-notice-message',
    refresh: '.anticon-reload',
    descriptionSelector: '[title=Description]',
    name: '#name',
    nodes_0_host: '#submitNodes_0_host',
    nodes_0_port: '#submitNodes_0_port',
    nodes_0_weight: '#submitNodes_0_weight',
    customSelector: '[title=Custom]',
    notificationClose: '.anticon-close',
    nameSelector: '[title=Name]',
    redirectURIInput: '#redirectURI',
    redirectCodeSelector: '#ret_code',
  };

  const data = {
    createPluginTemplateSuccess: 'Create Plugin Template Successfully',
    pluginTemplateName: 'test_plugin_template1',
    pluginTemplateName2: 'test_plugin_template2',
    pluginTemplateErrorAlert: 'Request Error Code: 10000',
    routeName: 'test_route',
    submitSuccess: 'Submit Successfully',
    deletePluginTemplateSuccess: 'Delete Plugin Template Successfully',
    deleteRouteSuccess: 'Delete Route Successfully',
    ip1: '127.0.0.1',
    port: '80',
    weight: 1,
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create test pluginTemplate', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(selector.empty).should('be.visible');
    cy.contains('Advanced').should('be.visible').click();
    cy.contains('Plugin Template Config').should('be.visible').click();
    cy.get(selector.empty).should('be.visible');
    cy.contains('Create').click();
    cy.get(selector.description).type(data.pluginTemplateName);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.createPluginTemplateSuccess);

    cy.visit('/routes/list');
    cy.contains('Create').click();

    // NOTE: make sure all components rerender done
    cy.contains('Next').click().click();
    cy.get(selector.name).type(data.routeName);
    cy.contains('Next').click();
    cy.get(selector.nodes_0_host).type(data.ip1);
    cy.get(selector.nodes_0_port).clear().type(data.port);
    cy.get(selector.nodes_0_weight).clear().type(data.weight);
    cy.contains('Next').click();
    cy.scrollTo(0, 0);
    cy.contains('Custom').should('be.visible');
    cy.get(selector.customSelector).click();
    cy.contains(data.pluginTemplateName).click();

    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess);
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should delete the pluginTemplate failure', function () {
    cy.visit('plugin-template/list');
    cy.get(selector.refresh).click();

    cy.get(selector.descriptionSelector).type(data.pluginTemplateName);
    cy.contains('button', 'Search').click();
    cy.contains(data.pluginTemplateName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.pluginTemplateErrorAlert);
    cy.get(selector.notificationClose).should('be.visible').click();
  });

  it('should edit the route with pluginTemplate', function () {
    cy.visit('routes/list');

    cy.get(selector.nameSelector).type(data.routeName);
    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('Configure').click();

    cy.contains('Forbidden').click();
    cy.contains('Custom').click();
    cy.get(selector.redirectURIInput).clear().type('123');
    cy.get(selector.redirectCodeSelector).click();
    cy.contains('301(Permanent Redirect)').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess);
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should delete the pluginTemplate successfully', function () {
    cy.visit('/routes/list');
    cy.get(selector.nameSelector).type(data.routeName);
    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('More').click();
    cy.contains('Delete').should('be.visible').click();
    cy.get('.ant-modal-content')
      .should('be.visible')
      .within(() => {
        cy.contains('OK').click();
      });
    cy.get(selector.notification).should('contain', data.deleteRouteSuccess);

    cy.visit('plugin-template/list');
    cy.get(selector.refresh).click();
    cy.get(selector.descriptionSelector).type(data.pluginTemplateName);
    cy.contains('button', 'Search').click();
    cy.contains(data.pluginTemplateName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deletePluginTemplateSuccess);
  });
});
