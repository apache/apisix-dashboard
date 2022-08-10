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
/* eslint-disable */

context('Create and Batch Deletion Routes', () => {
  const timeout = 5000;

  const selector = {
    name: '#name',
    description: '#desc',
    hosts_0: '#hosts_0',
    uris_0: '#uris_0',
    labels_0_labelKey: '#labels_0_labelKey',
    labels_0_labelValue: '#labels_0_labelValue',
    nodes_0_host: '#submitNodes_0_host',
    nodes_0_port: '#submitNodes_0_port',
    nodes_0_weight: '#submitNodes_0_weight',
    nameSearchInput: '#name',
    pathSearchInput: '#uri',
    drawerBody: '.ant-drawer-wrapper-body',
    notification: '.ant-notification-notice-message',
    notificationClose: '.anticon-close',
  };

  const data = {
    host1: '11.11.11.11',
    host2: '12.12.12.12',
    port: '80',
    weight: 1,
    uris: '/get',
    uris0: '/get0',
    uris1: '/get1',
    uris2: '/get2',
    urisx: '/getx',
    submitSuccess: 'Submit Successfully',
    deleteRouteSuccess: 'Delete Route Successfully',
    test: 'test',
    test0: 'test0',
    test1: 'test1',
    test2: 'test2',
    testx: 'testx',
    desc0: 'desc0',
    desc1: 'desc1',
    desc2: 'desc2',
    value0: 'value0',
    label0_value0: 'label0:value0',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should successfully create 3 routes', function () {
    cy.visit('/');
    cy.contains('Route').click();
    for (let i = 0; i < 3; i += 1) {
      cy.contains('Create').click();
      cy.contains('Next').click().click();
      cy.get(selector.name).type(`test${i}`);
      cy.get(selector.description).type(`desc${i}`);
      cy.get(selector.hosts_0).type(data.host1);
      cy.get(selector.uris_0).clear().type(`/get${i}`);

      // config label
      cy.contains('Manage').click();

      // eslint-disable-next-line no-loop-func
      cy.get(selector.drawerBody).within(() => {
        cy.contains('button', 'Add')
          .should('not.be.disabled')
          .click()
          .then(() => {
            cy.get(selector.labels_0_labelKey).type(`label${i}`);
            cy.get(selector.labels_0_labelValue).type(`value${i}`);
            cy.contains('Confirm').click();
          });
      });

      cy.contains('button', 'Next').should('not.be.disabled').click();
      cy.get(selector.nodes_0_host).type(data.host2, {
        timeout,
      });
      cy.get(selector.nodes_0_port).type(data.port);
      cy.get(selector.nodes_0_weight).type(data.weight);
      cy.contains('Next').click();
      cy.contains('Next').click();
      cy.contains('Submit').click();
      cy.contains(data.submitSuccess);
      cy.contains('Goto List').click();
      cy.url().should('contains', 'routes/list');
    }
  });

  it('should delete the route', function () {
    cy.visit('/routes/list');
    cy.contains(data.test0).get('[type="checkbox"]').check();
    cy.contains(data.test2).get('[type="checkbox"]').check();
    cy.contains('BatchDeletion Routes').should('be.visible').click({ timeout });
    cy.get(selector.notification).should('contain', data.deleteRouteSuccess);
    cy.get(selector.notificationClose).should('be.visible').click({
      force: true,
      multiple: true,
    });
  });

  it('should batch delete the name of the route', function () {
    cy.visit('/');
    cy.contains('Route').click();
    // full match
    cy.get(selector.nameSearchInput).type(data.test0);
    cy.contains('Search').click();
    cy.contains(data.test1).should('not.exist');
    cy.contains(data.test0).should('not.exist');
    cy.contains(data.test2).should('not.exist');
    // partial match
    cy.get(selector.nameSearchInput).clear().type(data.test2);
    cy.contains('Search').click();
    cy.contains(data.test0).should('not.exist');
    cy.contains(data.test1).should('not.exist');
    cy.contains(data.test2).should('not.exist');
    // no match
    cy.get(selector.nameSearchInput).clear().type(data.testx);
    cy.contains('Search').click();
    cy.contains(data.test0).should('not.exist');
    cy.contains(data.test1).should('not.exist');
    cy.contains(data.test2).should('not.exist');
  });

  it('should batch delete the path of the route', function () {
    cy.visit('/');
    cy.contains('Route').click();
    // full match
    cy.get(selector.pathSearchInput).type(data.uris0);
    cy.contains('Search').click();
    cy.contains(data.uris1).should('not.exist');
    cy.contains(data.uris0).should('not.exist');
    cy.contains(data.uris2).should('not.exist');
    // partial match
    cy.get(selector.pathSearchInput).clear().type(data.uris2);
    cy.contains('Search').click();
    cy.contains(data.uris0).should('not.exist');
    cy.contains(data.uris1).should('not.exist');
    cy.contains(data.uris2).should('not.exist');
    // no match
    cy.get(selector.pathSearchInput).clear().type(data.urisx);
    cy.contains('Search').click();
    cy.contains(data.uris0).should('not.exist');
    cy.contains(data.uris1).should('not.exist');
    cy.contains(data.uris2).should('not.exist');
  });
});
