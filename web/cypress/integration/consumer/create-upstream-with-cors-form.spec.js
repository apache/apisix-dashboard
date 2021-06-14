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
    empty:'.ant-empty-normal',
    username: '#username',
    description: '#desc',
    pluginCard: '.ant-card',
    drawer: '.ant-drawer-content',
    dropdown: '.rc-virtual-list',
    disabledSwitcher: '#disable',
    notification: '.ant-notification-notice-message',
    notificationCloseIcon: '.ant-notification-close-icon',
    rate: '#rate',
    burst: '#burst',
    key: '#key',
    remote_addr: '[title=remote_addr]',
    max_age: '#max_age',
    allow_origins_by_regex: '#allow_origins_by_regex_0',
    monacoViewZones: '.view-zones'
  }

  const data = {
    consumerName: 'test_consumer',
    description: 'desc_by_autotest',
    createConsumerSuccess: 'Create Consumer Successfully',
    deleteConsumerSuccess: 'Delete Consumer Successfully',
    time: 2,
  }

  beforeEach(() => {
    cy.login();
  });

  it('creates consumer with cors form', function () {
    cy.visit('/');
    cy.contains('Consumer').click();
    cy.get(selector.empty).should('be.visible');
    cy.contains('Create').click();
    // basic information
    cy.get(selector.username).type(data.consumerName);
    cy.get(selector.description).type(data.description);
    cy.contains('Next').click();

    // config auth plugin
    cy.contains(selector.pluginCard, 'key-auth').within(() => {
      cy.contains('Enable').click({
        force: true
      });
    });
    cy.focused(selector.drawer).should('exist');
    cy.get(selector.monacoViewZones).should('exist');
    cy.get(selector.disabledSwitcher).click().should('have.class', 'ant-switch-checked');

    // edit monaco
    cy.window().then((window) => {
      window.monacoEditor.setValue(JSON.stringify({ key: 'test' }));

      cy.contains('button', 'Submit').click();
    });

    cy.contains(selector.pluginCard, 'cors').within(() => {
      cy.contains('Enable').click({
        force: true,
      });
    });

    cy.get(selector.drawer).should('be.visible');

    cy.get(selector.max_age).clear();
    // config cors form
    cy.get(selector.drawer).within(() => {
      cy.contains('Submit').click({
        force: true,
      });
    });
    cy.get(selector.notification).should('contain', 'Invalid plugin data');
    cy.get(selector.notificationCloseIcon).click().should('not.exist');

    cy.get(selector.max_age).type(data.time);
    cy.get(selector.allow_origins_by_regex).type('.*.test.com');
    cy.get(selector.drawer).within(() => {
      cy.contains('Submit').click({
        force: true,
      });
    });
    cy.get(selector.drawer).should('not.exist');

    cy.contains('button', 'Next').click();
    cy.contains('button', 'Submit').click();
    cy.get(selector.notification).should('contain', data.createConsumerSuccess);
    cy.get(selector.notificationCloseIcon).click().should('not.exist');
  });

  it('delete the consumer', function () {
    cy.visit('/consumer/list');
    cy.contains(data.consumerName).should('be.visible').siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteConsumerSuccess);
  });
});
