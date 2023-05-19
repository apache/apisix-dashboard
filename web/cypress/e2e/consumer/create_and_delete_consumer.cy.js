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

context('Create and Delete Consumer', () => {
  const selector = {
    empty: '.ant-empty-normal',
    username: '#username',
    description: '#desc',
    pluginCard: '.ant-card',
    drawer: '.ant-drawer-content',
    disabledSwitcher: '#disable',
    notification: '.ant-notification-notice-message',
    nameSelector: '[title=Name]',
    serviceSelector: '[title=test_service]',
    monacoScroll: '.monaco-scrollable-element',
    monacoViewZones: '.view-zones',
    notificationCloseIcon: '.ant-notification-close-icon',
  };

  const data = {
    consumerName: 'test_consumer',
    noPluginsConsumerName: 'no_plugins_consumer',
    description: 'desc_by_autotest',
    createConsumerSuccess: 'Create Consumer Successfully',
    deleteConsumerSuccess: 'Delete Consumer Successfully',
    editConsumerSuccess: 'Edit Consumer Successfully',
    pluginErrorAlert: 'Invalid plugin data',
  };

  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('creates consumer without plugins', function () {
    cy.visit('/consumer/list');
    cy.contains('Create').click();
    // basic information
    cy.get(selector.username).type(data.noPluginsConsumerName);
    cy.get(selector.description).type(data.description);
    cy.contains('Next').click();

    cy.contains('button', 'Next').click();
    cy.contains('button', 'Submit').click();
    cy.get(selector.notification).should('contain', data.createConsumerSuccess);

    // should configure the comsumer
    cy.contains(data.noPluginsConsumerName)
      .should('be.visible')
      .siblings()
      .contains('Configure')
      .click();
    cy.url().should('contain', `/${data.noPluginsConsumerName}/edit`);
    cy.get('#username').should('have.value', data.noPluginsConsumerName);
    cy.get('#desc').should('have.value', data.description);
    cy.contains('button', 'Next').click();
    cy.get('[data-cy-plugin-name="basic-auth"]').should('be.visible');
    cy.contains('button', 'Next').click();
    cy.contains('button', 'Submit').click();
    cy.get(selector.notification).should('contain', data.editConsumerSuccess);

    cy.contains(data.noPluginsConsumerName)
      .should('be.visible')
      .siblings()
      .contains('Delete')
      .click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteConsumerSuccess);
  });

  it('creates consumer with key-auth', function () {
    cy.visit('/');
    cy.contains('Consumer').click();
    cy.get(selector.empty).should('be.visible');
    cy.contains('Create').click();
    // basic information
    cy.get(selector.username).type(data.consumerName);
    cy.get(selector.description).type(data.description);
    cy.contains('Next').click();

    // plugin config
    cy.contains(selector.pluginCard, 'key-auth').within(() => {
      cy.contains('Enable').click({
        force: true,
      });
    });
    cy.focused(selector.drawer).should('exist');
    cy.get(selector.disabledSwitcher).click();

    // edit monaco
    cy.get(selector.monacoViewZones).should('exist').click({
      force: true,
    });
    cy.window().then((window) => {
      window.monacoEditor.setValue(
        JSON.stringify({
          key: 'test',
        }),
      );
      cy.contains('button', 'Submit').click();
    });
    cy.contains('button', 'Next').click();
    cy.contains('button', 'Submit').click();
    cy.get(selector.notification).should('contain', data.createConsumerSuccess);
  });

  it('should view the consumer', function () {
    cy.visit('/consumer/list');

    cy.get(selector.nameSelector).type(data.consumerName);
    cy.contains('Search').click();
    cy.contains('key-auth').should('be.visible');
    cy.contains(data.consumerName).siblings().contains('View').click();
    cy.get(selector.drawer).should('be.visible');

    cy.get(selector.monacoScroll).within(() => {
      cy.contains('plugins').should('exist');
      cy.contains(data.consumerName).should('exist');
    });
  });

  it('delete the consumer', function () {
    cy.visit('/consumer/list');
    cy.contains(data.consumerName).should('be.visible').siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteConsumerSuccess);
  });

  it('creates consumer with wrong json', function () {
    cy.visit('/consumer/list');
    cy.contains('Create').click();
    // basic information
    cy.get(selector.username).type(data.consumerName);
    cy.get(selector.description).type(data.description);
    cy.contains('Next').click();

    // plugin config
    cy.contains(selector.pluginCard, 'key-auth').within(() => {
      cy.get('button').click({
        force: true,
      });
    });

    // edit monaco
    cy.get(selector.monacoViewZones).should('exist').click({
      force: true,
    });
    cy.window().then((window) => {
      window.monacoEditor.setValue(
        JSON.stringify({
          key_not_exist: 'test',
        }),
      );
      cy.contains('button', 'Submit').click();
    });
    cy.get(selector.notification).should('contain', data.pluginErrorAlert);
  });
});
