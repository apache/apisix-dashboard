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

context('Table Auto Jump When No Data', () => {
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

  before(() => {
    cy.login().then(() => {
      Array.from({ length: 11 }).forEach((value, key) => {
        const payload = {
          username: data.consumerName + key,
          plugins: {
            'key-auth': {
              key: 'test',
              disable: false,
            },
          },
        };
        cy.requestWithToken({ method: 'PUT', payload, url: '/apisix/admin/consumers' });
      });
    });
  });

  it('should delete last data and jump to first page', () => {
    cy.visit('/');
    cy.contains('Consumer').click();
    cy.get(selector.page_item).click();
    cy.wait(1000);
    cy.contains('Delete').click();
    cy.get(selector.popoper)
      .not(selector.popoprerHiden)
      .contains('Confirm')
      .should('be.visible')
      .click();
    cy.get(selector.notification).should('contain', data.deleteConsumerSuccess);
    cy.get(selector.notificationCloseIcon).click();
    cy.url().should('contains', '/consumer/list?page=1&pageSize=10');
    cy.get(selector.table_row).should((consumer) => {
      expect(consumer).to.have.length(10);
    });
    cy.get(`.ant-table-cell:contains(${data.consumerName})`).each((elem) => {
      cy.requestWithToken({
        method: 'DELETE',
        url: `/apisix/admin/consumers/${elem.text()}`,
      });
    });
  });
});
