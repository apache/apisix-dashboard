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

context('Create and delete consumer with api-breaker plugin form', () => {
  const selector = {
    break_response_code: '#break_response_code',
    break_response_body: '#break_response_body',
    break_response_headers_0_key: '#break_response_headers_0_key',
    break_response_headers_0_value: '#break_response_headers_0_value',
    empty: '.ant-empty-normal',
    username: '#username',
    description: '#desc',
    pluginCard: '.ant-card',
    drawer: '.ant-drawer-content',
    disabledSwitcher: '#disable',
    notification: '.ant-notification-notice-message',
    monacoViewZones: '.view-zones',
  };

  const data = {
    break_response_code: 200,
    break_response_body: 'breaker opened',
    break_response_headers_0_key: 'Content-Type',
    break_response_headers_0_value: 'application/json',
    consumerName: 'test_consumer',
    description: 'desc_by_autotest',
    createConsumerSuccess: 'Create Consumer Successfully',
    deleteConsumerSuccess: 'Delete Consumer Successfully',
  };

  beforeEach(() => {
    cy.login();
  });

  it('creates consumer with api-breaker form', function () {
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

    cy.contains(selector.pluginCard, 'api-breaker').within(() => {
      cy.contains('Enable').click({
        force: true,
      });
    });

    cy.focused(selector.drawer).should('exist');

    // config api-breaker form
    cy.get(selector.drawer).within(() => {
      cy.contains('Submit').click({
        force: true,
      });
    });
    cy.get(selector.notification).should('contain', 'Invalid plugin data');
    cy.contains('.ant-form-item', 'break_response_headers').within(() => {
      cy.contains('button', 'Create').click();
    });
    cy.get(selector.break_response_code).type(data.break_response_code);
    cy.get(selector.break_response_body).type(data.break_response_body);
    cy.get(selector.break_response_headers_0_key).type(data.break_response_headers_0_key);
    cy.get(selector.break_response_headers_0_value).type(data.break_response_headers_0_value);
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
