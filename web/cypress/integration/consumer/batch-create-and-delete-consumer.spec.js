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

context('Batch Create And Delete Consumer', () => {
  const selector = {
    username: '#username',
    page_item: '.ant-pagination-item-2',
    deleteAlert: '.ant-modal-body',
    notificationCloseIcon: '.ant-notification-close-icon',
    notification: '.ant-notification-notice-message',
    table_row: '.ant-table-row',
    pluginCard: '.ant-card',
    drawer: '.ant-drawer-content',
    monacoScroll: '.monaco-scrollable-element',
    monacoViewZones: '.view-zones',
    disabledSwitcher: '#disable',
    popoper: '.ant-popover',
    popoprerHiden: '.ant-popover-hidden',
  };

  const data = {
    consumerName: 'test_consumer',
    createConsumerSuccess: 'Create Consumer Successfully',
    deleteConsumerSuccess: 'Delete Consumer Successfully',
  };

  const deleteConsumer = (consumerName) => {
    cy.contains(consumerName).siblings().contains('Delete').click({ force: true });
    cy.get(selector.popoper)
      .not(selector.popoprerHiden)
      .contains('Confirm')
      .should('be.visible')
      .click({ force: true });
    cy.get(selector.notification).should('contain', data.deleteConsumerSuccess);
    cy.get(selector.notificationCloseIcon).click();
  };

  beforeEach(() => {
    cy.login();
  });

  it('should batch create eleven consumer', () => {
    cy.visit('/');
    cy.contains('Consumer').click();

    Array.from({ length: 11 }).forEach((value, key) => {
      cy.wait(500);
      cy.contains('Create').click();
      cy.get(selector.username).type(data.consumerName + key);
      cy.contains('Next').click();

      cy.contains('Next').click();
      cy.get(selector.notification).should(
        'contain',
        'Please enable at least one of the following authentication plugin: basic-auth, hmac-auth, jwt-auth, key-auth, ldap-auth, wolf-rbac',
      );
      cy.get(selector.notificationCloseIcon).click().should('not.exist');

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
      cy.get(selector.notificationCloseIcon).click();
    });
  });

  it('should delete the consumer', () => {
    cy.visit('/');
    cy.contains('Consumer').click();
    cy.wait(1000);
    cy.get(selector.page_item).click();
    deleteConsumer(data.consumerName + 10);
    cy.url().should('contains', '/consumer/list?page=1&pageSize=10');
    cy.get(selector.table_row).should((consumer) => {
      expect(consumer).to.have.length(10);
    });
    cy.wait(1000);
    Array.from({ length: 10 }).forEach((value, key) => {
      deleteConsumer(data.consumerName + (9 - key));
      console.log(9 - key);
    });
  });
});
