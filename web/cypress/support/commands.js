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
import 'cypress-file-upload';
import '@4tw/cypress-drag-drop';

Cypress.Commands.add('login', () => {
  const { SERVE_URL } = Cypress.env();

  cy.request('POST', `${SERVE_URL}/apisix/admin/user/login`, {
    username: 'user',
    password: 'user',
  }).then((res) => {
    expect(res.body.code).to.equal(0);
    localStorage.setItem('token', res.body.data.token);
    // set default language
    localStorage.setItem('umi_locale', 'en-US');
  });
});

const timeout = 1000;
const domSelector = {
  nameGen: (name) => `[data-cy-plugin-name="${name}"]`,
  parents: '.ant-card-bordered',
  drawer_wrap: '.ant-drawer-content-wrapper',
  drawer: '.ant-drawer-content',
  switch: 'button.ant-switch#disable',
  close: '.anticon-close',
  selectDropdown: '.ant-select-dropdown',
  monacoMode: '[data-cy="monaco-mode"] > .ant-select-selector',
  selectJSON: '[label=JSON]',
  monacoViewZones: 'div.view-zones',
  notification: '.ant-notification-notice-message',
};

Cypress.Commands.add('configurePlugin', ({ name, content }) => {
  const { shouldValid, data } = content;

  cy.get('main.ant-layout-content')
    .should('exist')
    .find(domSelector.nameGen(name))
    .then(function (card) {
      card.parents(domSelector.parents).find('button').trigger('click', {
        force: true,
      });

      // NOTE: wait for the Drawer to appear on the DOM
      cy.get(domSelector.drawer)
        .should('exist')
        .within(() => {
          cy.wait(timeout);
          // trick for stable
          cy.contains('Enable').should('exist');
          cy.get(domSelector.switch, { timeout }).should('exist').click({
            force: true,
          });

          cy.get(domSelector.monacoMode)
            .should('be.visible')
            .then(($btn) => {
              if ($btn.text() === 'Form') {
                cy.get(domSelector.monacoMode)
                  .should('exist')
                  .click({ force: true })
                  .then(() => {
                    cy.root()
                      .closest('body')
                      .find(domSelector.selectDropdown)
                      .should('be.visible')
                      .find(domSelector.selectJSON)
                      .click();
                  });
              }
            });

          // edit monaco
          cy.wait(timeout * 2);
          cy.get(domSelector.monacoViewZones).should('exist').click({ force: true });

          cy.window()
            .then((win) => {
              if (data) win.monacoEditor.setValue(JSON.stringify(data));
            })
            .then(() => {
              cy.contains('Submit').click({
                force: true,
              });
            });
        });

      if (shouldValid) {
        cy.wait(timeout);
        cy.get(domSelector.drawer, { timeout }).should('not.exist');
      } else {
        cy.get(domSelector.notification).should('contain', 'Invalid plugin data');

        cy.get(domSelector.close).should('be.visible').click({
          force: true,
          multiple: true,
        });

        cy.wait(timeout);
        cy.get(domSelector.drawer)
          .invoke('show')
          .within(() => {
            cy.contains('Cancel').click({
              force: true,
            });
          });
      }
    });
});

Cypress.Commands.add('requestWithToken', ({ method, url, payload }) => {
  const { SERVE_URL } = Cypress.env();
  // Make sure the request is synchronous
  cy.request({
    method,
    url: SERVE_URL + url,
    body: payload,
    headers: { Authorization: localStorage.getItem('token') },
  }).then((res) => {
    expect(res.body.code).to.equal(0);
    return res;
  });
});
