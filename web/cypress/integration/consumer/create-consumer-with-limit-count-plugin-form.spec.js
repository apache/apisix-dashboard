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

context('Create and delete consumer with limit-count plugin form', () => {

  const selector = {
    empty:'.ant-empty-normal',
    username: '#username',
    description: '#desc',
    pluginCard: '.ant-card',
    drawer: '.ant-drawer-content',
    dropdown: '.rc-virtual-list',
    disabledSwitcher: '#disable',
    notification: '.ant-notification-notice-message',
    count: '#count',
    time_window: '#time_window',
    key: '#key',
    rejected_code: '#rejected_code',
    policy: '#policy',
    redis_host: '#redis_host',
    redis_port: '#redis_port',
    redis_password: '#redis_password',
    redis_database: '#redis_database',
    redis_cluster_name: '#redis_cluster_name',
    redis_cluster_nodes_0: '#redis_cluster_nodes_0',
    redis_cluster_nodes_1: '#redis_cluster_nodes_1',
    monacoViewZones: '.view-zones'
  }

  const data = {
    consumerName: 'test_consumer',
    description: 'desc_by_autotest',
    createConsumerSuccess: 'Create Consumer Successfully',
    deleteConsumerSuccess: 'Delete Consumer Successfully',
    redisClusterName: 'Please Enter redis_cluster_name',
    redisClusterNode: 'Please Enter redis_cluster_node',
  }

  beforeEach(() => {
    cy.login();
  });

  it('should create consumer with limit-count form', function () {
    cy.visit('/');
    cy.contains('Consumer').click();
    cy.get(selector.empty).should('be.visible');
    cy.contains('Create').click();
    // basic information
    cy.get(selector.username).type(data.consumerName);
    cy.get(selector.description).type(data.description);
    cy.contains('Next').click();

    // config auth plugin
    cy.contains(selector.pluginCard, 'key-auth').within(() => {
      cy.contains('Enable').click({
        force: true,
      });
    });
    cy.focused(selector.drawer).should('exist');
    cy.get(selector.monacoViewZones).should('exist');
    cy.get(selector.disabledSwitcher).click();

    // edit monaco
    cy.window().then((window) => {
      window.monacoEditor.setValue(JSON.stringify({ key: 'test' }));
      cy.contains('button', 'Submit').click();
    });

    cy.contains(selector.pluginCard, 'limit-count').within(() => {
      cy.contains('Enable').click({
        force: true,
      });
    });

    cy.focused(selector.drawer).should('exist');

    // config limit-count form with local policy
    cy.get(selector.count).type(1);
    cy.get(selector.time_window).type(1);
    cy.get(selector.rejected_code).type(500);
    cy.get(selector.drawer).within(() => {
      cy.contains('Submit').click({
        force: true,
      });
    });
    cy.get(selector.drawer).should('not.exist');

    // config limit-count form with redis policy
    cy.contains(selector.pluginCard, 'limit-count').within(() => {
      cy.contains('Enable').click({
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
      cy.contains('Enable').click({
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
    cy.get(selector.notification).should('contain', data.createConsumerSuccess);
  });

  it('should delete the consumer', function () {
    cy.visit('/consumer/list');
    cy.contains(data.consumerName).should('be.visible').siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(selector.notification).should('contain', data.deleteConsumerSuccess);
  });
});
