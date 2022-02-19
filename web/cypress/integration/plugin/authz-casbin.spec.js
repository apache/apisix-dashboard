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

context('text authz casbin plugin', () => {
  const timeout = 5000;

  const selector = {
    pluginCardBordered: '.ant-card-bordered',
    drawer: '.ant-drawer-content',
    selectDropdown: '.ant-select-dropdown',
    monacoMode: "[data-cy='monaco-mode']",
    selectJSON: '.ant-select-dropdown [label=JSON]',
    drawerFooter: '.ant-drawer-footer',
    disabledSwitcher: '#disable',
    checkedSwitcher: '.ant-switch-checked',
    refresh: '.anticon-reload',
    empty: '.ant-empty-normal',
    conmodel_path: '#model_path',
    conpolicy_path: '#policy_path',
    username: '#username'
  };

  const data = {
    authzCasbin: 'authz-casbin',
    conmodel_path: '#/path/to/model.conf',
    conpolicy_path: '#/path/to/policy.csv',
    conusername: '#user',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should visit plugin market and enabl plugin', function () {
    cy.visit('/');
    cy.contains('Plugin').click();
    cy.contains('Enable').click();
    cy.contains(data.authzCasbin)
      .parents(selector.pluginCardBordered)
      .within(() => {
        cy.get('button').click({
          force: true,
        })
      })
    cy.get(selector.drawer)
      .should('be.visible')
      .within(() => {
        cy.get(selector.disabledSwitcher).click();
        cy.get(selector.checkedSwitcher).should('exist');
      })
    cy.get(selector.conmodel_path).type(data.conmodel_path);
    cy.get(selector.conpolicy_path).type(data.conpolicy_path);
    cy.get(selector.username).type(data.conusername);
    cy.contains('Button', 'Submit').click();
    cy.contains('Plugin').click();
    cy.contains('Button','Delete').click();
    cy.contains('Confirm').click();
    cy.contains('Enable').click();
  })
});
