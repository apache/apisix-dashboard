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

context('Data Loader import', () => {
  const selector = {
    drawer: '.ant-drawer-content',
    selectDropdown: '.ant-select-dropdown',
    listTbody: '.ant-table-tbody',
    listRow: 'tr.ant-table-row-level-0',
    refresh: '.anticon-reload',
    notification: '.ant-notification-notice-message',
    notificationCloseIcon: '.ant-notification-notice-close',
    fileSelector: '[type=file]',
    notificationDesc: '.ant-notification-notice-description',
    task_name: '#task_name',
    merge_method: '#merge_method',
  };
  const data = {
    importRouteSuccess: 'Import Successfully',
    deleteRouteSuccess: 'Delete Route Successfully',
    deleteUpstreamSuccess: 'Delete Upstream Successfully',
  };
  const cases = {
    API101: '../../../api/test/testdata/import/Postman-API101.yaml',
  };

  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
    cy.fixture('export-route-dataset.json').as('exportFile');
  });

  it('should import API101 with merge mode', () => {
    cy.visit('/');
    cy.contains('Route').click();

    cy.get(selector.refresh).click();
    cy.contains('Advanced').click();
    cy.contains('Import').should('be.visible').click();

    // select Data Loader type
    cy.contains('OpenAPI 3').should('be.visible').click();
    cy.get(selector.selectDropdown).contains('OpenAPI 3').should('be.visible').click();
    cy.get(selector.drawer).get(selector.task_name).type('api101_mm');
    cy.get(selector.fileSelector).attachFile(cases.API101);
    cy.get(selector.drawer).contains('Submit').click();
    cy.get(selector.drawer).contains('Import Successfully').should('be.visible');
    cy.get(selector.drawer).contains('Total 3 route imported, 0 failed').click();
    cy.get(selector.drawer).contains('Close').click();
    cy.get(selector.drawer).should('not.exist');

    // check result
    cy.get(selector.listTbody).get(selector.listRow).should('have.length', 3);
    cy.contains('api101_mm_customer').should('be.visible');
    cy.contains('api101_mm_customer/{customer_id}').should('be.visible');
    cy.contains('api101_mm_customers').should('be.visible');

    // remove route
    for (let i = 0; i < 3; i += 1) {
      cy.get(selector.listTbody).get(selector.listRow).contains('More').click();
      cy.contains('Delete').should('be.visible').click();
      cy.contains('OK').should('be.visible').click();
      cy.get(selector.notification).should('contain', data.deleteRouteSuccess);
      cy.get(selector.notificationCloseIcon).click();
    }
  });

  it('should import API101 with duplicate upstream', () => {
    cy.visit('/');
    cy.contains('Route').click();

    cy.get(selector.refresh).click();
    cy.contains('Advanced').click();
    cy.contains('Import').should('be.visible').click();

    // select Data Loader type
    cy.contains('OpenAPI 3').should('be.visible').click();
    cy.get(selector.selectDropdown).contains('OpenAPI 3').should('be.visible').click();
    cy.get(selector.drawer).get(selector.task_name).type('api101_mm');
    cy.get(selector.fileSelector).attachFile(cases.API101);
    cy.get(selector.drawer).contains('Submit').click();
    cy.get(selector.drawer).contains('Import Failed').should('be.visible');
    cy.get(selector.drawer).contains('Total 1 upstream imported, 1 failed').click();
    cy.get(selector.drawer).contains('key: api101_mm is conflicted').should('be.visible');
    cy.get(selector.drawer).contains('Close').click();
    cy.get(selector.drawer).should('not.exist');

    // remove route
    for (let i = 0; i < 3; i += 1) {
      cy.get(selector.listTbody).get(selector.listRow).contains('More').click();
      cy.contains('Delete').should('be.visible').click();
      cy.contains('OK').should('be.visible').click();
      cy.get(selector.notification).should('contain', data.deleteRouteSuccess);
      cy.get(selector.notificationCloseIcon).click();
    }
  });

  it('should import API101 with non-merge mode', () => {
    cy.visit('/');
    cy.contains('Route').click();

    cy.get(selector.refresh).click();
    cy.contains('Advanced').click();
    cy.contains('Import').should('be.visible').click();

    // select Data Loader type
    cy.contains('OpenAPI 3').should('be.visible').click();
    cy.get(selector.selectDropdown).contains('OpenAPI 3').should('be.visible').click();
    cy.get(selector.drawer).get(selector.task_name).type('api101_nmm');
    cy.get(selector.drawer).get(selector.merge_method).click();
    cy.get(selector.fileSelector).attachFile(cases.API101);
    cy.get(selector.drawer).contains('Submit').click();
    cy.get(selector.drawer).contains('Import Successfully').should('be.visible');
    cy.get(selector.drawer).contains('Total 5 route imported, 0 failed').click();
    cy.get(selector.drawer).contains('Close').click();
    cy.get(selector.drawer).should('not.exist');

    // check result
    cy.get(selector.listTbody).get(selector.listRow).should('have.length', 5);
  });

  it('should import API101 with duplicate route', () => {
    cy.visit('/');
    cy.contains('Route').click();

    cy.get(selector.refresh).click();
    cy.contains('Advanced').click();
    cy.contains('Import').should('be.visible').click();

    // select Data Loader type
    cy.contains('OpenAPI 3').should('be.visible').click();
    cy.get(selector.selectDropdown).contains('OpenAPI 3').should('be.visible').click();
    cy.get(selector.drawer).get(selector.task_name).type('api101_nmm');
    cy.get(selector.drawer).get(selector.merge_method).click();
    cy.get(selector.fileSelector).attachFile(cases.API101);
    cy.get(selector.drawer).contains('Submit').click();
    cy.get(selector.drawer).contains('Import Failed').should('be.visible');
    cy.get(selector.drawer).contains('Total 5 route imported, 1 failed').click();
    cy.get(selector.drawer).contains('is duplicated with route api101_nmm_').should('be.visible');
    cy.get(selector.drawer).contains('Close').click();
    cy.get(selector.drawer).should('not.exist');
  });

  it('should remove all routes and upstreams', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(selector.refresh).click();
    // remove route
    for (let i = 0; i < 5; i += 1) {
      cy.get(selector.listTbody).get(selector.listRow).contains('More').click();
      cy.contains('Delete').should('be.visible').click();
      cy.contains('OK').should('be.visible').click();
      cy.get(selector.notification).should('contain', data.deleteRouteSuccess);
      cy.get(selector.notificationCloseIcon).click();
    }

    cy.visit('/');
    cy.contains('Upstream').click();
    cy.get(selector.refresh).click();
    // remove route
    for (let i = 0; i < 2; i += 1) {
      cy.get(selector.listTbody).get(selector.listRow).contains('Delete').click();
      cy.contains('Confirm').should('be.visible').click();
      cy.get(selector.notification).should('contain', data.deleteUpstreamSuccess);
      cy.get(selector.notificationCloseIcon).click();
    }
  });
});
