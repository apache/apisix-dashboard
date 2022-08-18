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

context('Create Route with advanced matching conditions', () => {
  const selector = {
    name: '#name',
    nodes_0_host: '#submitNodes_0_host',
    nodes_0_port: '#submitNodes_0_port',
    nodes_0_weight: '#submitNodes_0_weight',
    deleteAlert: '.ant-modal-body',
    notification: '.ant-notification-notice-message',
    parameterPosition: '#position',
    ruleCard: '.ant-modal',
    reverse: '#reverse',
    operator: '#operator',
    value: '#value',
    advancedMatchingTable: '.ant-table-row.ant-table-row-level-0',
    advancedMatchingTableOperation: '.ant-space',
    advancedMatchingTableCell: '.ant-table-cell',
  };

  const data = {
    routeName: `test_route_${new Date().valueOf()}`,
    submitSuccess: 'Submit Successfully',
    ip1: '127.0.0.1',
    port: '80',
    weight: 1,
    matchingParamName: 'server_port',
    deleteRouteSuccess: 'Delete Route Successfully',
  };

  const opreatorList = [
    // 'Equal(==)' : '1234',
    'Unequal(~=)',
    'Greater Than(>)',
    'Less Than(<)',
    // 'Regex Match(~~)',
    'IN',
  ];

  const matchingValueList1 = ['1000', '800', '2000', '["1800","1888"]'];

  const matchingValueList2 = ['2000', '1800', '3000', '["2800","2888"]'];

  beforeEach(() => {
    cy.login();
  });

  it('should create route with advanced matching conditions', function () {
    cy.visit('/routes/list');
    cy.contains('Create').click();
    cy.contains('Next').click().click();
    cy.get(selector.name).type(data.routeName);

    // All Of Operational Character Should Exist And Can be Created
    cy.wrap(opreatorList).each((opreator, index) => {
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
                cy.contains('Built-in').should('be.visible').click();
              });
            });
          cy.get(selector.ruleCard).within(() => {
            cy.get(selector.name).type(data.matchingParamName);
          });
          // reverse switch should exist
          cy.get(selector.reverse)
            .should('exist')
            .and('be.visible')
            .should('have.class', 'ant-switch')
            .and('not.have.class', 'ant-switch-checked')
            .click()
            .and('have.class', 'ant-switch-checked');
          cy.get(selector.operator).click();
          cy.get(`[title="${opreator}"]`).should('be.visible').click();
          cy.get(selector.value).type(matchingValueList1[index]);
          cy.contains('Confirm').click();
        });
    });
    cy.get(selector.advancedMatchingTable).should('exist');
    cy.wrap(opreatorList).each((operator, index) => {
      cy.get(selector.advancedMatchingTableCell).within(() => {
        cy.contains('th', 'Reverse the result(!)').should('be.visible');
        cy.contains('td', 'Built-in Parameter').should('be.visible');
        cy.contains('td', data.matchingParamName).should('be.visible');
        cy.contains('td', matchingValueList1[index]).should('be.visible');
      });
    });
    cy.contains('Next').click();
    cy.get(selector.nodes_0_host).clear().type(data.ip1);
    cy.get(selector.nodes_0_port).type(data.port);
    cy.get(selector.nodes_0_weight).type(data.weight);
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess).should('be.visible');
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should edit this route matching conditions', function () {
    cy.visit('/routes/list');
    cy.get(selector.name).clear().type(data.routeName);
    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('Configure').click();
    cy.get(selector.advancedMatchingTable).should('exist');
    cy.wrap(opreatorList).each((opreator, index) => {
      cy.get(selector.advancedMatchingTableCell).within(() => {
        cy.contains(`${opreator}`)
          .parent('tr')
          .within(() => {
            cy.get(selector.advancedMatchingTableOperation).within(() => {
              cy.contains('Configure').click();
            });
          });
      });
      cy.get(selector.ruleCard).within(() => {
        cy.get(`[title="Built-in Parameter"]`).should('have.class', 'ant-select-selection-item');
        cy.get(selector.name).clear().type(data.matchingParamName);
        cy.get(selector.reverse).should('have.class', 'ant-switch-checked');
        cy.get(`[title="${opreator}"]`).should('have.class', 'ant-select-selection-item');
        cy.get(selector.value).clear().type(matchingValueList2[index]);
        cy.contains('Confirm').click();
      });
      cy.get(selector.advancedMatchingTableCell).within(() => {
        cy.contains('th', 'Reverse the result(!)').should('be.visible');
        cy.contains('td', 'Built-in Parameter').should('be.visible');
        cy.contains('td', data.matchingParamName).should('be.visible');
        cy.contains('td', matchingValueList2[index]).should('be.visible');
      });
    });
    cy.contains('Next').click();
    cy.get(selector.nodes_0_port).focus();
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess);
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should delete route matching conditions', function () {
    cy.visit('/routes/list');
    cy.get(selector.name).clear().type(data.routeName);
    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('Configure').click();
    cy.get(selector.name).should('value', data.routeName);
    cy.get(selector.advancedMatchingTable).should('exist');
    cy.wrap(opreatorList).each(() => {
      cy.get(selector.advancedMatchingTableOperation).within(() => {
        cy.contains('Delete').click().should('not.exist');
      });
    });
    cy.get(selector.advancedMatchingTable).should('not.exist');
    cy.contains('Next').click();
    cy.get(selector.nodes_0_port).focus();
    cy.contains('Next').click();
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess);
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');

    cy.visit('/routes/list');
    cy.get(selector.name).clear().type(data.routeName);
    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('More').click();
    cy.contains('Delete').click();
    cy.get(selector.deleteAlert)
      .should('be.visible')
      .within(() => {
        cy.contains('OK').click();
      });
    cy.get(selector.notification).should('contain', data.deleteRouteSuccess);
  });
});
