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

context('Batch Create Upstream And Delete Upstream', () => {
  const selector = {
    id: '#id',
    name: '#name',
    nodes_0_host: '#submitNodes_0_host',
    page_item: '.ant-pagination-item-2',
    deleteAlert: '.ant-modal-body',
    notificationCloseIcon: '.ant-notification-close-icon',
    notification: '.ant-notification-notice-message',
    table_row: ' .ant-table-row',
  };

  const data = {
    createUpstreamSuccess: 'Create Upstream Successfully',
    deleteUpstreamSuccess: 'Delete Upstream Successfully',
  };

  const deleteUpstream = (upstreamName) => {
    cy.contains(upstreamName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteUpstreamSuccess);
    cy.get('.ant-notification-close-x').click();
  };

  beforeEach(() => {
    cy.login();
  });

  it('should batch create eleven upstream', () => {
    cy.visit('/');
    cy.contains('Upstream').click();

    Array.from({ length: 11 }).forEach((value, key) => {
      cy.contains('Create').click();
      cy.contains('Next').click().click();
      cy.get(selector.name).type(`upstreamName${key}`);
      cy.get(selector.nodes_0_host).type('127.0.0.1');
      cy.contains('Next').click();
      cy.contains('button', 'Submit').click();
      cy.get(selector.notification).should('contain', data.createUpstreamSuccess);
      cy.get('.ant-notification-close-x').click();
    });
  });

  it('should delete the upstream', () => {
    cy.visit('/');
    cy.contains('Upstream').click();
    cy.wait(1000);
    cy.get(selector.page_item).click();
    deleteUpstream('upstreamName10');
    cy.url().should('contains', '/upstream/list?page=1&pageSize=10');
    cy.get(selector.table_row).should((upstream) => {
      expect(upstream).to.have.length(10);
    });
    Array.from({ length: 10 }).forEach((value, key) => {
      deleteUpstream(`upstreamName${9 - key}`);
    });
  });
});
