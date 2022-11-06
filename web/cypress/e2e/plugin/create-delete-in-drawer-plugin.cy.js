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

context('Delete Plugin List with the Drawer', () => {
  const timeout = 4000;

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
    tab: '.ant-tabs-tab',
    tabBtn: '.ant-tabs-tab-btn',
    notification: '.ant-notification-notice',
    notificationCloseIcon: '.ant-notification-notice-close',
  };

  const data = {
    basicAuthPlugin: 'basic-auth',
    keyAuthPlugin: 'key-auth',
    jwtAuthPlugin: 'jwt-auth',
  };

  before(() => {
    cy.clearLocalStorageSnapshot();
    cy.login();
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  it('should visit plugin market and enable plugin', function () {
    cy.visit('/');
    cy.contains('Plugin').click();
    cy.contains('Enable').click();

    cy.contains(data.basicAuthPlugin)
      .parents(selector.pluginCardBordered)
      .within(() => {
        cy.get('button').click({
          force: true,
        });
      });

    cy.get(selector.monacoMode)
      .invoke('text')
      .then((text) => {
        if (text === 'Form') {
          cy.get(selector.monacoMode).click();
          cy.get(selector.selectDropdown).should('be.visible');
          cy.get(selector.selectJSON).click();
        }
      });

    cy.get(selector.drawer)
      .should('be.visible')
      .within(() => {
        cy.get(selector.disabledSwitcher).click();
        cy.get(selector.checkedSwitcher).should('exist');
      });

    cy.contains('button', 'Submit').click();
    cy.get(selector.drawer, {
      timeout,
    }).should('not.exist');
  });

  it('should verify openid-connect and authz-keycloak plugin need to configure', function () {
    cy.visit('/');
    cy.contains('Plugin').click();
    cy.contains('Enable').click();
    ['openid-connect', 'authz-keycloak'].forEach((plugin) => {
      cy.contains(plugin)
        .parents(selector.pluginCardBordered)
        .within(() => {
          cy.get('button').click({
            force: true,
          });
        });
      cy.get(selector.drawer)
        .should('be.visible')
        .within(() => {
          cy.contains('.ant-alert-warning', "Doesn't need configuration").should('not.exist');
          cy.contains('button', 'Cancel').click();
        });
    });
  });

  it('should delete the plugin with the drawer', function () {
    cy.visit('/plugin/list');
    cy.get(selector.refresh).click();
    cy.contains('button', 'Configure').click();
    cy.get(selector.drawerFooter).contains('button', 'Delete').click({
      force: true,
    });
    cy.contains('button', 'Confirm').click({
      force: true,
    });
    cy.get(selector.notification).should('contain', 'Delete Plugin Successfully');
    cy.get(selector.notificationCloseIcon).click({ multiple: true });
    cy.wait(timeout);
    cy.get(selector.empty).should('be.visible');
  });

  it('should delete the plugin with the drawer in the list of plugins', function () {
    cy.visit('/plugin/list');
    cy.get(selector.refresh).click();
    cy.contains('Enable').click();

    cy.contains(data.basicAuthPlugin)
      .parents(selector.pluginCardBordered)
      .within(() => {
        cy.get('button').click({
          force: true,
        });
      });
    cy.get(selector.drawer)
      .should('be.visible')
      .within(() => {
        cy.get(selector.disabledSwitcher).click();
        cy.wait(timeout);
        cy.get(selector.checkedSwitcher).should('exist');
      });
    cy.contains('button', 'Submit').click();

    cy.contains(data.basicAuthPlugin)
      .parents(selector.pluginCardBordered)
      .within(() => {
        cy.get('button').click({
          force: true,
        });
      });

    cy.contains('button', 'Delete').click({
      force: true,
    });
    cy.contains('button', 'Confirm').click({
      force: true,
    });
    cy.get(selector.notification).should('contain', 'Delete Plugin Successfully');
    cy.get(selector.notificationCloseIcon).click({ multiple: true });

    cy.contains(data.basicAuthPlugin)
      .parents(selector.pluginCardBordered)
      .within(() => {
        cy.get('button').then(($el) => {
          const text = $el.text();
          expect(text).to.eq('Enable');
        });
      });
    cy.visit('/plugin/list');
    cy.get(selector.empty).should('be.visible');
  });

  it('should be switched tabs to distinguish enable ', function () {
    cy.visit('/plugin/list');
    cy.get(selector.refresh).click();
    cy.contains('button', 'Enable').click();
    cy.contains(data.basicAuthPlugin)
      .parents(selector.pluginCardBordered)
      .within(() => {
        cy.get('button').click({
          force: true,
        });
      });
    cy.get(selector.drawer)
      .should('be.visible')
      .within(() => {
        cy.get(selector.disabledSwitcher).click();
        cy.get(selector.checkedSwitcher).should('exist');
      });
    cy.contains('button', 'Submit').click({ force: true });
    cy.wait(timeout);
    cy.get(selector.tab).within(() => {
      cy.contains(selector.tabBtn, 'Enable').click({
        force: true,
      });
    });

    cy.contains(data.basicAuthPlugin)
      .parents(selector.pluginCardBordered)
      .within(() => {
        cy.get('button').click({
          force: true,
        });
      });

    cy.contains('button', 'Delete').click({
      force: true,
    });
    cy.contains('button', 'Confirm').click({
      force: true,
    });

    cy.get(selector.tab).within(() => {
      cy.contains(selector.tabBtn, 'All').click({
        force: true,
      });
    });
    cy.contains(data.basicAuthPlugin).should('exist');
    cy.visit('/plugin/list');
    cy.get(selector.empty).should('be.visible');
  });

  it('should be deleted one of the plugins instead of all', function () {
    cy.visit('/plugin/list');
    cy.get(selector.refresh).click();
    cy.contains('Enable').click();

    const pluginList = [data.jwtAuthPlugin, data.basicAuthPlugin, data.keyAuthPlugin];
    pluginList.forEach((item) => {
      cy.contains(item)
        .parents(selector.pluginCardBordered)
        .within(() => {
          cy.get('button').click({
            force: true,
          });
        });

      cy.wait(timeout);
      cy.get(selector.drawer)
        .should('be.visible')
        .within(() => {
          cy.get(selector.disabledSwitcher).focus().click();
          cy.get(selector.checkedSwitcher).should('exist');
        });
      cy.contains('button', 'Submit').click();

      cy.get(selector.drawer, {
        timeout,
      }).should('not.exist');
      cy.get(selector.notification).should('contain', 'Configure Plugin Successfully');
      cy.get(selector.notificationCloseIcon).click({ multiple: true });
    });

    cy.reload();
    cy.contains(data.basicAuthPlugin)
      .parents(selector.pluginCardBordered)
      .within(() => {
        cy.get('button').click({
          force: true,
        });
      });
    cy.get(selector.drawer).should('be.visible');
    cy.contains('button', 'Delete').click();
    cy.contains('button', 'Confirm').click({
      force: true,
    });
    cy.get(selector.drawer, {
      timeout,
    }).should('not.exist');
    cy.get(selector.notification).should('contain', 'Delete Plugin Successfully');
    cy.get(selector.notificationCloseIcon).click({ multiple: true });

    const remainPlugin = pluginList.filter((item) => item !== data.basicAuthPlugin);
    remainPlugin.forEach((item) =>
      cy
        .contains(item)
        .parents(selector.pluginCardBordered)
        .within(() => {
          cy.get('button').should('contain', 'Edit');
        }),
    );

    cy.visit('/plugin/list');
    cy.contains('Enable').click();

    remainPlugin.forEach((item) => {
      cy.contains(item)
        .parents(selector.pluginCardBordered)
        .within(() => {
          cy.get('button').click({ force: true });
        });
      cy.get(selector.drawer)
        .should('be.visible')
        .within(() => {
          cy.get(selector.disabledSwitcher).should('exist');
        });
      cy.wait(timeout);
      cy.contains('button', 'Delete').click({ force: true });
      cy.contains('button', 'Confirm').click({ force: true });
      cy.get(selector.drawer, {
        timeout,
      }).should('not.exist');
      cy.get(selector.notification).should('contain', 'Delete Plugin Successfully');
      cy.get(selector.notificationCloseIcon).click({ multiple: true });
    });
    cy.visit('/plugin/list');
    cy.get(selector.empty).should('be.visible');
  });
});
