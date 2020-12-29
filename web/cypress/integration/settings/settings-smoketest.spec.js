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

context('settings page smoke test', () => {
  const domSelectors = {
    pageContent: '.ant-pro-page-container',
    notificationMsg: '.ant-notification-notice-message',
  };

  beforeEach(() => {
    // init login
    cy.login();
  });

  it('should visit settings page', () => {
    // go to settings page
    cy.visit('/');
    cy.contains('Settings').click();
    cy.wait(500);
    cy.url().should('contains', '/settings');
    cy.get(domSelectors.pageContent)
      .children()
      .should('contain', 'Setting')
      .and('contain', 'Grafana Address')
      .and('contain', 'Grafana address should begin with HTTP or HTTPS');
  });

  it('should set a invaild url', () => {
    cy.visit('/');
    cy.contains('Settings').click();
    cy.wait(500);
    cy.url().should('contains', '/settings');
    cy.get('#grafanaURL').clear().type('httx://www.test.com');
    cy.get('.ant-form-item-explain').should('contain', 'Address is illegality');
  });

  it('should set a accessible url', () => {
    cy.visit('/');
    cy.contains('Settings').click();
    cy.wait(500);
    cy.url().should('contains', '/settings');
    cy.get('#grafanaURL').clear().type('https://apisix.apache.org/');
    cy.contains('Submit').click();
    cy.get(domSelectors.notificationMsg).should('contain', 'Update Configuration Successfully');
    cy.wait(1000);
    cy.get(domSelectors.pageContent).children().should('contain', 'Metrics');
  });
});
