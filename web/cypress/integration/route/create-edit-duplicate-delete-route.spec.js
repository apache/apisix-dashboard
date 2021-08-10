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

context('Create and Delete Route', () => {
  const name = `routeName${new Date().valueOf()}`;
  const newName = `newName${new Date().valueOf()}`;
  const duplicateNewName = `duplicateName${new Date().valueOf()}`;
  const timeout = 5000;

  const selector = {
    empty: '.ant-empty-normal',
    name: '#name',
    description: '#desc',
    hosts_0: '#hosts_0',
    hosts_1: '#hosts_1',
    remoteHost: '#remote_addrs_0',
    remoteAddress: '[data-cy=addRemoteAddr]',
    address1: '#remote_addrs_1',
    parameterPosition: '#position',
    ruleCard: '.ant-modal',
    operator: '#operator',
    value: '#value',
    nodes_0_host: '#nodes_0_host',
    nodes_0_port: '#nodes_0_port',
    nodes_0_weight: '#nodes_0_weight',
    pluginCardBordered: '.ant-card-bordered',
    disabledSwitcher: '#disable',
    checkedSwitcher: '.ant-switch-checked',
    drawer: '.ant-drawer-content',
    selectDropdown: '.ant-select-dropdown',
    monacoMode: "[data-cy='monaco-mode']",
    selectJSON: '.ant-select-dropdown [label=JSON]',
    drawerFooter: '.ant-drawer-footer',
    nameSelector: '[title=Name]',
    monacoScroll: '.monaco-scrollable-element',
    deleteAlert: '.ant-modal-body',
    notificationCloseIcon: '.ant-notification-close-icon',
    notification: '.ant-notification-notice-message',
    addHost: '[data-cy=addHost]',
    schemaErrorMessage: '.ant-form-item-explain.ant-form-item-explain-error',
    advancedMatchingTable: '.ant-table-row.ant-table-row-level-0',
    advancedMatchingTableOperation: '.ant-space',
  };

  const data = {
    description: 'desc_by_autotest',
    host1: '11.11.11.11',
    host2: '12.12.12.12',
    host3: '10.10.10.10',
    host4: '@',
    host5: '*1',
    port: '80',
    weight: 1,
    basicAuthPlugin: 'basic-auth',
    submitSuccess: 'Submit Successfully',
    description2: 'description2',
    deleteRouteSuccess: 'Delete Route Successfully',
  };

  const opreatorList = [
    'Equal(==)',
    'Case insensitive regular match(~*)',
    'HAS',
    'Reverse the result(!)',
  ];

  beforeEach(() => {
    cy.login();
  });

  it('should create route', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(selector.empty).should('be.visible');
    cy.contains('Create').click();
    cy.contains('Next').click().click();
    cy.get(selector.name).type(name);
    cy.get(selector.description).type(data.description);

    // input request basic define
    cy.get(selector.hosts_0).type(data.host1);
    cy.get(selector.addHost).click();
    cy.get(selector.hosts_1).type(data.host2);
    cy.get(selector.remoteHost).type(data.host2);
    cy.get(selector.remoteAddress).click();
    cy.get(selector.address1).type(data.host3);

    // All Of Operational Character Should Exist And Can be Created
    cy.wrap(opreatorList).each((opreator) => {
      cy.contains('Advanced Routing Matching Conditions')
        .parent()
        .siblings()
        .contains('Add')
        .click()
        .then(() => {
          cy.get(selector.parameterPosition)
            .click()
            .then(() => {
              cy.get('.ant-select-dropdown').within(() => {
                cy.contains('Cookie').should('be.visible').click();
              });
            });
          cy.get(selector.ruleCard).within(() => {
            cy.get(selector.name).type('modalName');
          });
          cy.get(selector.operator).click();
          cy.get(`[title="${opreator}"]`).should('be.visible').click();
          cy.get(selector.value).type('value');
          cy.contains('Confirm').click();
        });
    });

    cy.contains('Next').click();
    cy.get(selector.nodes_0_host).type(data.host4);
    cy.get(selector.schemaErrorMessage).should('exist');
    cy.get(selector.nodes_0_host).clear().type(data.host5);
    cy.get(selector.schemaErrorMessage).should('not.exist');
    cy.get(selector.nodes_0_host).clear().type(data.host2);
    cy.get(selector.nodes_0_port).type(data.port);
    cy.get(selector.nodes_0_weight).type(data.weight);
    cy.contains('Next').click();

    // redirect plugin should not display in route step3
    const nameSelector = '[data-cy-plugin-name]';
    cy.get(nameSelector).then((cards) => {
      [...cards].forEach((card) => {
        expect(card.innerText).to.not.equal('redirect');
      });
    });

    // config basic auth plugin
    cy.contains(data.basicAuthPlugin)
      .parents(selector.pluginCardBordered)
      .within(() => {
        cy.get('button').click({ force: true });
      });

    cy.get(selector.drawer)
      .should('be.visible')
      .within(() => {
        cy.get(selector.disabledSwitcher).click();
        cy.get(selector.checkedSwitcher).should('exist');
      });

    cy.get(selector.monacoMode).click();
    cy.get(selector.selectDropdown).should('be.visible');
    cy.get(selector.selectJSON).click();

    cy.contains('button', 'Submit').click();
    cy.get(selector.drawer, { timeout }).should('not.exist');

    cy.contains(data.basicAuthPlugin)
      .parents(selector.pluginCardBordered)
      .within(() => {
        cy.get('button').click({ force: true });
      });

    cy.get(selector.drawerFooter).contains('button', 'Delete').click({ force: true });
    cy.contains('button', 'Confirm').click({ force: true });

    cy.contains(data.basicAuthPlugin)
      .parents(selector.pluginCardBordered)
      .within(() => {
        cy.get('button').click({ force: true });
      });

    cy.get(selector.drawerFooter).contains('button', 'Delete').should('not.exist');
    cy.contains('button', 'Cancel').click({ force: true });

    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess);

    // back to route list page
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should view the route', function () {
    cy.visit('/');
    cy.contains('Route').click();

    cy.get(selector.nameSelector).type(name);
    cy.contains('Search').click();
    cy.contains(name).siblings().contains('More').click();
    cy.contains('View').click();
    cy.get(selector.drawer).should('be.visible');

    cy.get(selector.monacoScroll).within(() => {
      cy.contains('upstream').should('exist');
      cy.contains('vars').should('exist');
      cy.contains('uri').should('exist');
      cy.contains('hosts').should('exist');
      cy.contains('remote_addr').should('exist');
      cy.contains(name).should('exist');
    });
  });

  it('should edit the route', function () {
    cy.visit('/');
    cy.contains('Route').click();

    cy.get(selector.nameSelector).type(name);
    cy.contains('Search').click();
    cy.contains(name).siblings().contains('Configure').click();

    // NOTE: make sure all components rerender done
    cy.get('#status').should('have.class', 'ant-switch-checked');
    cy.get(selector.name).clear().type(newName);
    cy.get(selector.description).clear().type(data.description2);

    cy.get(selector.advancedMatchingTable).should('exist');
    cy.wrap(opreatorList).each(() => {
      cy.get(selector.advancedMatchingTableOperation).within(() => {
        cy.contains('Delete').click().should('not.exist');
      });
    });

    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess);
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
    cy.contains(newName).siblings().should('contain', data.description2);

    // test view
    cy.contains(newName).siblings().contains('More').click();
    cy.contains('View').click();
    cy.get(selector.drawer).should('be.visible');

    cy.get(selector.monacoScroll).within(() => {
      cy.contains('upstream').should('exist');
      cy.contains(newName).should('exist');
      cy.contains('vars').should('not.exist');
    });
  });

  it('should duplicate the route', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.reload();

    cy.get(selector.nameSelector).type(newName);
    cy.contains('Search').click();
    cy.contains(newName).siblings().contains('More').click();
    cy.contains('Duplicate').click();

    // NOTE: make sure all components rerender done
    cy.get('#status').should('have.class', 'ant-switch-checked');
    cy.get(selector.name).clear().type(duplicateNewName);
    cy.get(selector.description).clear().type(data.description2);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess);
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
    cy.contains(duplicateNewName).siblings().should('contain', data.description2);

    // test view
    cy.contains(duplicateNewName).siblings().contains('More').click();
    cy.contains('View').click();
    cy.get(selector.drawer).should('be.visible');

    cy.get(selector.monacoScroll).within(() => {
      cy.contains('upstream').should('exist');
      cy.contains(duplicateNewName).should('exist');
    });
  });

  it('should delete the route', function () {
    cy.visit('/routes/list');
    const routeNames = [newName, duplicateNewName];
    routeNames.forEach(function (routeName) {
      cy.get(selector.name).clear().type(routeName);
      cy.contains('Search').click();
      cy.contains(routeName).siblings().contains('More').click();
      cy.contains('Delete').click();
      cy.get(selector.deleteAlert)
        .should('be.visible')
        .within(() => {
          cy.contains('OK').click();
        });
      cy.get(selector.notification).should('contain', data.deleteRouteSuccess);
      cy.get(selector.notificationCloseIcon).click();
    });
  });
});
