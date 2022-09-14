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

context('Create and delete consumer with limit-conn plugin form', () => {
  const selector = {
    empty: '.ant-empty-normal',
    username: '#username',
    description: '#desc',
    pluginCard: '.ant-card',
    drawer: '.ant-drawer-content',
    dropdown: '.rc-virtual-list',
    disabledSwitcher: '#disable',
    notification: '.ant-notification-notice-message',
    selectDropdown: '.ant-select-dropdown',
    conn: '#conn',
    burst: '#burst',
    default_conn_delay: '#default_conn_delay',
    only_use_default_delay: '#only_use_default_delay',
    key: '#key',
    rejected_code: '#rejected_code',
    monacoViewZones: '.view-zones',
  };

  const data = {
    consumerName: 'test_consumer',
    description: 'desc_by_autotest',
    createConsumerSuccess: 'Create Consumer Successfully',
    deleteConsumerSuccess: 'Delete Consumer Successfully',
    conn: 1,
    burst: 0,
    default_conn_delay: 1,
    key: 'remote_addr',
  };

  beforeEach(() => {
    cy.login();
  });

  it('creates consumer with limit-conn form', function () {
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
        force: true,
      });
    });
    cy.focused(selector.drawer).should('exist');
    cy.get(selector.monacoViewZones).should('exist');
    cy.get(selector.disabledSwitcher).click();

    // edit monaco
    cy.window().then((window) => {
      window.monacoEditor.setValue(JSON.stringify({ key: 'test' }));
      cy.contains('button', 'Submit').click();
    });

    cy.contains(selector.pluginCard, 'limit-conn').within(() => {
      cy.contains('Enable').click({
        force: true,
      });
    });

    cy.focused(selector.drawer).should('exist');

    // config limit-conn form
    cy.get(selector.conn).type(data.conn);
    cy.get(selector.burst).type(data.burst);
    cy.get(selector.default_conn_delay).type(data.default_conn_delay);
    cy.get(selector.only_use_default_delay).click();
    cy.get(selector.key).type(data.key);
    cy.get(selector.disabledSwitcher).click();
    cy.get(selector.drawer).within(() => {
      cy.contains('Submit').click({
        force: true,
      });
    });
    cy.get(selector.drawer).should('not.exist');

    cy.contains('button', 'Next').click();
    cy.contains('button', 'Submit').click();
    cy.get(selector.notification).should('contain', data.createConsumerSuccess);
  });

  it('delete the consumer', function () {
    cy.visit('/consumer/list');
    cy.contains(data.consumerName).should('be.visible').siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteConsumerSuccess);
  });
});
