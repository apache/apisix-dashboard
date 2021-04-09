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
import defaultSettings from '../../config/defaultSettings';
import 'cypress-file-upload';

Cypress.Commands.add('login', () => {
  const { SERVE_ENV = 'dev' } = Cypress.env();

  cy.request('POST', `${defaultSettings.serveUrlMap[SERVE_ENV]}/apisix/admin/user/login`, {
    username: 'user',
    password: 'user',
  }).then((res) => {
    expect(res.body.code).to.equal(0);
    localStorage.setItem('token', res.body.data.token);
    // set default language
    localStorage.setItem('umi_locale', 'en-US');
  });
});

Cypress.Commands.add('configurePlugins', (cases) => {
  const timeout = 300;
  const domSelector = {
    name: '[data-cy-plugin-name]',
    parents: '.ant-card-bordered',
    drawer_wrap: '.ant-drawer-content-wrapper',
    drawer: '.ant-drawer-content',
    switch: '#disable',
    close: '.anticon-close',
    selectDropdown: '.ant-select-dropdown',
    codeMirrorMode: '[data-cy="code-mirror-mode"]',
    selectJSON: '.ant-select-dropdown [label=JSON]'
  };

  cy.get(domSelector.name, { timeout }).then(function (cards) {
    [...cards].forEach((card) => {
      const name = card.innerText;
      const pluginCases = cases[name] || [];
      // eslint-disable-next-line consistent-return
      pluginCases.forEach(({ shouldValid, data, type = '' }) => {
        if (type === 'consumer') {
          return true;
        }

        cy.contains(name)
          .parents(domSelector.parents)
          .within(() => {
            cy.contains('Enable').click({
              force: true,
            });
          });

        // NOTE: wait for the Drawer to appear on the DOM
        cy.focused(domSelector.drawer).should('exist');
        cy.get(domSelector.drawer, { timeout }).within(() => {
          cy.get(domSelector.switch).click({
            force: true,
          });
        });

        cy.window().then(({ codemirror }) => {
          if (codemirror) {
            codemirror.setValue(JSON.stringify(data));
          }
          cy.get(domSelector.drawer).should('exist');

          cy.get(domSelector.codeMirrorMode).invoke('text').then(text => {
            if (text === 'Form') {
              cy.get(domSelector.codeMirrorMode).click();
              cy.get(domSelector.selectDropdown).should('be.visible');
              cy.get(domSelector.selectJSON).click();
            }
          });

          cy.get(domSelector.drawer, { timeout }).within(() => {
            cy.contains('Submit').click({
              force: true,
            });
            cy.get(domSelector.drawer).should('not.exist');
          });
        });

        if (shouldValid === true) {
          cy.get(domSelector.drawer).should('not.exist');
        } else if (shouldValid === false) {
          cy.get(this.domSelector.notification).should('contain', 'Invalid plugin data');

          cy.get(domSelector.close).should('be.visible').click({
            force: true,
            multiple: true,
          });

          cy.get(domSelector.drawer, { timeout })
            .invoke('show')
            .within(() => {
              cy.contains('Cancel').click({
                force: true,
              });
            });
        }
      });
    });
  });
});
