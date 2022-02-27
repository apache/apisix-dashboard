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

context('Create and delete route with limit-count form', () => {
  const selector = {
    empty: '.ant-empty-normal',
    name: '#name',
    description: '#desc',
    disabledSwitcher: '#disable',
    drawer: '.ant-drawer-content',
    nodes_0_host: '#submitNodes_0_host',
    nodes_0_port: '#submitNodes_0_port',
    nodes_0_weight: '#submitNodes_0_weight',
    deleteAlert: '.ant-modal-body',
    notificationCloseIcon: '.ant-notification-close-icon',
    notification: '.ant-notification-notice-message',
    pluginCard: '.ant-card',
    count: '#count',
    time_window: '#time_window',
    redis_timeout: '#time_window',
    key: '#key',
    rejected_code: '#rejected_code',
    rejected_msg: '#rejected_msg',
    policy: '#policy',
    group: '#group',
    redis_host: '#redis_host',
    redis_port: '#redis_port',
    redis_password: '#redis_password',
    redis_database: '#redis_database',
    redis_cluster_name: '#redis_cluster_name',
    redis_cluster_nodes_0: '#redis_cluster_nodes_0',
    redis_cluster_nodes_1: '#redis_cluster_nodes_1',
    dropdown: '.rc-virtual-list',
  };

  const data = {
    deleteRouteSuccess: 'Delete Route Successfully',
    submitSuccess: 'Submit Successfully',
    port: '80',
    weight: 1,
    rejected_msg: 'Requests are too frequent, please try again later.',
    redisClusterName: 'Please Enter redis_cluster_name',
    redisClusterNode: 'Please Enter redis_cluster_node',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create route with limit-count form', function () {
    cy.visit('/');
    cy.contains('Route').click();
    cy.get(selector.empty).should('be.visible');
    cy.contains('Create').click();
    cy.contains('Next').click().click();
    cy.get(selector.name).type('routeName');
    cy.get(selector.description).type('desc');
    cy.contains('Next').click();

    cy.get(selector.nodes_0_host).type('127.0.0.1');
    cy.get(selector.nodes_0_port).clear().type(data.port);
    cy.get(selector.nodes_0_weight).clear().type(data.weight);
    cy.contains('Next').click();

    // config limit-count form with local policy
    cy.contains(selector.pluginCard, 'limit-count').within(() => {
      cy.get('button').click({
        force: true,
      });
    });
    cy.focused(selector.drawer).should('exist');
    cy.get(selector.disabledSwitcher).click();
    cy.get(selector.count).type(1);
    cy.get(selector.time_window).type(1);
    cy.get(selector.rejected_code).type(500);
    cy.get(selector.rejected_msg).type(data.rejected_msg);
    cy.get(selector.group).type('test_group');
    cy.get(selector.drawer).within(() => {
      cy.contains('Submit').click({
        force: true,
      });
    });
    cy.get(selector.drawer).should('not.exist');

    // config limit-count form with redis policy
    cy.contains(selector.pluginCard, 'limit-count').within(() => {
      cy.get('button').click({
        force: true,
      });
    });
    cy.focused(selector.drawer).should('exist');
    cy.contains('local').click();
    cy.get(selector.dropdown).within(() => {
      cy.contains('redis').click({
        force: true,
      });
    });
    cy.get(selector.redis_host).type('127.0.0.1');
    cy.get(selector.redis_password).type('redis_password');
    cy.get(selector.drawer).within(() => {
      cy.contains('Submit').click({
        force: true,
      });
    });
    cy.get(selector.drawer).should('not.exist');

    // config limit-count form with redis-cluster policy
    cy.contains(selector.pluginCard, 'limit-count').within(() => {
      cy.get('button').click({
        force: true,
      });
    });
    cy.focused(selector.drawer).should('exist');
    cy.contains('redis').click();
    cy.get(selector.dropdown).within(() => {
      cy.contains('redis-cluster').click({
        force: true,
      });
    });
    cy.get(selector.redis_cluster_name).click();
    cy.contains(data.redisClusterName);
    cy.get(selector.redis_cluster_nodes_0).click();
    cy.contains(data.redisClusterNode);

    cy.get(selector.redis_cluster_name).type('redis_cluster_name');
    cy.get(selector.redis_cluster_nodes_0).type('127.0.0.1:5000');
    cy.get(selector.redis_cluster_nodes_1).type('127.0.0.1:5001');
    cy.get(selector.drawer).within(() => {
      cy.contains('Submit').click({
        force: true,
      });
    });

    cy.get(selector.drawer).should('not.exist');
    cy.contains('button', 'Next').click();
    cy.contains('button', 'Submit').click();
    cy.contains(data.submitSuccess);

    // back to route list page
    cy.contains('Goto List').click();
    cy.url().should('contains', 'routes/list');
  });

  it('should delete the route', function () {
    cy.visit('/routes/list');

    cy.get(selector.name).clear().type('routeName');
    cy.contains('Search').click();
    cy.contains('routeName').siblings().contains('More').click();
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
