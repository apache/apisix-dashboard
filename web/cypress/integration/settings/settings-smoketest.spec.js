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
    start_explanation: 'Grafana address should begin with HTTP or HTTPS',
    after_explanation: 'Address is illegality',
    update_successfully: 'Update Configuration Successfully',
    invalid_URL: 'httx://www.test.com',
    new_URL: 'https://apisix.apache.org/',
    fetch_URL: 'fetchURL',
    fetch: '@fetchURL',
  }
  const domSelector = {
    page_content: '.ant-pro-page-container',
    notificationMsg: '.ant-notification-notice-message',
    setting: '.ant-space-align-center',
    grafama_URL: '#grafanaURL',
    explain: '.ant-form-item-explain',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should visit settings page', () => {
    cy.visit('/');
    cy.get(domSelector.setting).invoke('show').click('center');
    cy.contains('Settings').click();
    cy.url().should('contains', '/settings');
    cy.get(domSelector.page_content)
      .children()
      .should('contain', 'Setting')
      .and('contain', data.grafana_address)
      .and('contain', data.start_explanation);
  });

  it('should set a invalid url', () => {
    cy.visit('/');
    cy.get(domSelector.setting).invoke('show').click('center');
    cy.contains('Settings').click();
    cy.url().should('contains', '/settings');
    cy.get(domSelector.grafama_URL).clear().type(data.invalid_URL);
    cy.get(domSelector.explain).should('contain', data.after_explanation);
  });

  it('should set a accessible URL', () => {
    cy.visit('/');
    cy.get(domSelector.setting).invoke('show').click('center');
    cy.contains('Settings').click();
    cy.url().should('contains', '/settings');
    cy.get(domSelector.grafama_URL).clear().type(data.new_URL);
    cy.contains('Submit').click();

    cy.get(domSelector.notificationMsg).should('contain', data.update_successfully);
    cy.intercept(data.new_URL).as(data.fetch_URL);
    cy.wait(data.fetch);
    cy.get(domSelector.page_content).children().should('contain', 'Metrics');
  });
});
