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

context('Batch Create Proto And Delete Proto', () => {
  const selector = {
    id: '#id',
    content: '.view-lines',
    page_item: '.ant-pagination-item-2',
    draw: '.ant-drawer-content',
    deleteAlert: '.ant-modal-body',
    notificationCloseIcon: '.ant-notification-close-icon',
    notification: '.ant-notification-notice-message',
    table_row: '.ant-table-row',
  };

  const data = {
    createProtoSuccess: 'Create proto Successfully',
    deleteProtoSuccess: 'Delete proto Successfully',
  };

  const deleteProto = (protoId) => {
    cy.wait(500);
    cy.contains(protoId).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteProtoSuccess);
    cy.get(selector.notificationCloseIcon).click();
  };

  beforeEach(() => {
    cy.login();
  });

  it('should batch create eleven proto', () => {
    Array.from({ length: 11 }).forEach(async (value, key) => {
      const payload = {
        content: 'test',
        desc: '',
        id: `id${key}`,
      };
      cy.requestWithToken({ method: 'POST', payload, url: '/apisix/admin/proto' });
    });
  });

  it('should delete the proto', () => {
    cy.visit('/');
    cy.contains('Proto').click();
    cy.wait(1000);
    cy.get(selector.page_item).click();
    deleteProto('id10');
    cy.url().should('contains', '/proto/list?page=1&pageSize=10');
    cy.get(selector.table_row).should((proto) => {
      expect(proto).to.have.length(10);
    });
    Array.from({ length: 10 }).forEach((value, key) => {
      cy.requestWithToken({ method: 'DELETE', url: `/apisix/admin/proto/id${9 - key}` });
    });
  });
});
