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
  const data = {
    grafana_address: 'Grafana Address',
    grafana_explain1: 'Grafana address should begin with HTTP or HTTPS',
    grafana_explain2: 'Address is illegality',
    update_success: 'Update Configuration Successfully',
    url1: 'httx://www.test.com',
    url2: 'https://apisix.apache.org/',
    fetchURL: 'fetchURL',
    fetch: '@fetchURL',
  }
  const domSelector = {
    pageContent: '.ant-pro-page-container',
    notificationMsg: '.ant-notification-notice-message',
    setting: '.ant-space-align-center',
    grafamaURL: '#grafanaURL',
    explain: '.ant-form-item-explain',

  };

  beforeEach(() => {
    cy.login();
  });

  it('should visit settings page', () => {
    // go to settings page
    cy.visit('/');
    cy.get(domSelector.setting).invoke('show').click('center');
    cy.contains('Settings').click();
    cy.url().should('contains', '/settings');
    cy.get(domSelector.pageContent)
      .children()
      .should('contain', 'Setting')
      .and('contain', data.grafana_address)
      .and('contain', data.grafana_explain1);
  });

  it('should set a invalid url', () => {
    cy.visit('/');
    cy.get(domSelector.setting).invoke('show').click('center');
    cy.contains('Settings').click();
    cy.url().should('contains', '/settings');
    cy.get(domSelector.grafamaURL).clear().type(data.url1);
    cy.get(domSelector.explain).should('contain', data.grafana_explain2);
  });

  it('should set a accessible URL', () => {
    cy.visit('/');
    cy.get(domSelector.setting).invoke('show').click('center');
    cy.contains('Settings').click();
    cy.url().should('contains', '/settings');
    cy.get(domSelector.grafamaURL).clear().type(data.url2);
    cy.contains('Submit').click();

    cy.get(domSelector.notificationMsg).should('contain', data.update_success);
    cy.intercept(data.url2).as(data.fetchURL);
    cy.wait(data.fetch);
    cy.get(domSelector.pageContent).children().should('contain', 'Metrics');
  });
});
