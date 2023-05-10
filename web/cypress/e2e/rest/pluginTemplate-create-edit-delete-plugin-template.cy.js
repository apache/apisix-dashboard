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

context('Create Configure and Delete PluginTemplate', () => {
  const selector = {
    pluginCard: '.ant-card',
    empty: '.ant-empty-normal',
    description: '#desc',
    drawer: '.ant-drawer-content',
    monacoMode: "[data-cy='monaco-mode']",
    selectDropdown: '.ant-select-dropdown',
    selectJSON: '.ant-select-dropdown [label=JSON]',
    disabledSwitcher: '#disable',
    notification: '.ant-notification-notice-message',
    refresh: '.anticon-reload',
    descriptionSelector: '[title=Description]',
    pluginTitle: '.ant-divider-inner-text',
    pluginBtn: '.ant-btn-primary',
  };
  const data = {
    pluginTemplateName: 'test_plugin_template1',
    pluginTemplateName2: 'test_plugin_template2',
    createPluginTemplateSuccess: 'Create Plugin Template Successfully',
    editPluginTemplateSuccess: 'Configure Plugin Template Successfully',
    deletePluginTemplateSuccess: 'Delete Plugin Template Successfully',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create pluginTemplate', function () {
    cy.visit('/');
    cy.intercept('GET', '/apisix/admin/routes?*').as('view');
    cy.contains('Route').click();
    cy.wait('@view');
    cy.get(selector.empty).should('be.visible');
    cy.contains('Advanced').should('be.visible').click();
    cy.contains('Advanced').trigger('mouseover');
    cy.contains('Plugin Template Config').should('be.visible').click();
    cy.get(selector.empty).should('be.visible');
    cy.contains('Create').click();

    cy.get(selector.description).type(data.pluginTemplateName);
    cy.contains('Next').click();

    // should not see proxy-rewrite plugin in the step2
    cy.contains('proxy-rewrite').should('not.exist');

    cy.contains(selector.pluginCard, 'basic-auth').within(() => {
      cy.get('button').click({
        force: true,
      });
    });
    cy.focused(selector.drawer).should('exist');

    cy.get(selector.monacoMode).click();
    cy.get(selector.selectDropdown).should('be.visible');
    cy.get(selector.selectJSON).click();
    cy.get(selector.disabledSwitcher).click({
      force: true,
    });

    cy.contains('Submit').click();
    cy.contains('Next').click();
    cy.contains(selector.pluginCard, 'basic-auth').should('be.visible');
    cy.contains(selector.pluginTitle, 'Authentication').should('be.visible');
    cy.contains(selector.pluginTitle, 'Security').should('not.exist');
    cy.contains(selector.pluginTitle, 'Traffic Control').should('not.exist');
    cy.contains(selector.pluginTitle, 'Serverless').should('not.exist');
    cy.contains(selector.pluginTitle, 'Observability').should('not.exist');
    cy.contains(selector.pluginTitle, 'Other').should('not.exist');
    cy.contains(selector.pluginBtn, 'Enable').should('not.exist');
    cy.contains('Submit').click();
    cy.get(selector.notification).should('contain', data.createPluginTemplateSuccess);
  });

  it('should edit the pluginTemplate', function () {
    cy.visit('plugin-template/list');
    cy.get(selector.refresh).click();
    cy.get(selector.descriptionSelector).type(data.pluginTemplateName);
    cy.contains('button', 'Search').click();
    cy.contains(data.pluginTemplateName).siblings().contains('Configure').click();

    cy.get(selector.description).should('have.value', data.pluginTemplateName);
    cy.get(selector.description).clear().type(data.pluginTemplateName2);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains(selector.pluginCard, 'basic-auth').should('be.visible');
    cy.contains(selector.pluginTitle, 'Authentication').should('be.visible');
    cy.contains(selector.pluginTitle, 'Security').should('not.exist');
    cy.contains(selector.pluginTitle, 'Traffic Control').should('not.exist');
    cy.contains(selector.pluginTitle, 'Serverless').should('not.exist');
    cy.contains(selector.pluginTitle, 'Observability').should('not.exist');
    cy.contains(selector.pluginTitle, 'Other').should('not.exist');
    cy.contains(selector.pluginBtn, 'Enable').should('not.exist');
    cy.contains('Submit').click();

    cy.get(selector.notification).should('contain', data.editPluginTemplateSuccess);
  });

  it('should delete pluginTemplate', function () {
    cy.visit('plugin-template/list');
    cy.get(selector.refresh).click();
    cy.get(selector.descriptionSelector).type(data.pluginTemplateName);
    cy.contains('button', 'Search').click();
    cy.get(selector.empty).should('exist');

    cy.contains('button', 'Reset').click();
    cy.get(selector.descriptionSelector).type(data.pluginTemplateName2);
    cy.contains('button', 'Search').click();
    cy.contains(data.pluginTemplateName2).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deletePluginTemplateSuccess);
  });
});
