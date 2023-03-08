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
import componentLocaleUS from '../../../src/locales/en-US/component';
import menuLocaleUS from '../../../src/locales/en-US/menu';
import routeLocaleUS from '../../../src/pages/Route/locales/en-US';

context('create route with proxy-rewrite plugin', () => {
  const selector = {
    name: '#name',
    nodes_0_host: '#submitNodes_0_host',
    nodes_0_port: '#submitNodes_0_port',
    nodes_0_weight: '#submitNodes_0_weight',
    nameSelector: '[title=Name]',
    deleteAlert: '.ant-modal-body',
    notification: '.ant-notification-notice-message',
    staticUri: '[data-cy=uri-static]',
    regexUri: '[data-cy=uri-regex]',
    staticHost: '[data-cy=host-static]',
    keepHost: '[data-cy=host-keep]',
    newUri: '#proxyRewrite_uri',
    uriRewriteReg: '#proxyRewrite_regex_uri_0',
    uriRewriteTemp: '#proxyRewrite_regex_uri_1',
    newHost: '#proxyRewrite_host',
    methodRewriteSelect: '[data-cy=proxyRewrite-method]',
    methodRewriteSelectOption: '.ant-select-item-option',
    buttonCreateNewRewriteHeader: '[data-cy=create-new-rewrite-header]',
    rewriteHeaderKey1: '#proxyRewrite_kvHeaders_0_key',
    rewriteHeaderValue1: '#proxyRewrite_kvHeaders_0_value',
    rewriteHeaderKey2: '#proxyRewrite_kvHeaders_1_key',
    rewriteHeaderValue2: '#proxyRewrite_kvHeaders_1_value',
  };

  const data = {
    host2: '12.12.12.12',
    port: '80',
    weight: 1,
    routeName: 'test_route',
    submitSuccess: 'Submit Successfully',
    deleteRouteSuccess: 'Delete Route Successfully',
    rewriteUri: '/get',
    rewriteHeaderKey1: 'test1',
    rewriteHeaderKey2: 'test2',
    rewriteHeaderValue1: '1',
    rewriteHeaderValue2: '2',
    regex: '^/iresty/(.)/(.)/(.*)',
  };

  beforeEach(() => {
    cy.login();
  });

  it('should create route with proxy-rewrite plugin', function () {
    cy.visit('/');
    cy.contains(menuLocaleUS['menu.routes']).click();

    // show create page
    cy.contains(componentLocaleUS['component.global.create']).click();
    cy.contains('Next').click().click();
    cy.get(selector.name).type(data.routeName);

    // show requestOverride PanelSection
    cy.contains(routeLocaleUS['page.route.panelSection.title.requestOverride']).should(
      'be.visible',
    );
    // should show newPath after the URIRewriteType static clicked
    cy.get(selector.staticUri).click();
    cy.contains(routeLocaleUS['page.route.form.itemLabel.newPath']).should('be.visible');
    cy.get(selector.newUri).should('be.visible').type(data.rewriteUri);
    // should show regexp and template after URIRewriteType regexp clicked
    cy.contains(routeLocaleUS['page.route.radio.regex']).click();
    cy.contains(routeLocaleUS['page.route.form.itemLabel.regex']).should('be.visible');
    cy.get(selector.uriRewriteReg).should('be.visible');
    cy.contains(routeLocaleUS['page.route.form.itemLabel.template']).should('be.visible');
    cy.get(selector.uriRewriteTemp).should('be.visible');

    cy.get(selector.staticUri).click();

    // should show newhost after static host clicked
    cy.get(selector.staticHost).click();
    cy.contains(routeLocaleUS['page.route.form.itemLabel.newHost']).should('be.visible');
    cy.get(selector.newHost).should('be.visible');
    cy.get(selector.keepHost).click();
    cy.get(selector.newHost).should('not.exist');

    // method rewrite
    cy.get(selector.methodRewriteSelect).click();
    cy.get(selector.methodRewriteSelectOption).contains('POST').click();

    // new header key value input after createNewRewriteHeader button clicked
    cy.get(selector.buttonCreateNewRewriteHeader).click();
    cy.get(selector.rewriteHeaderKey1).should('be.visible').type(data.rewriteHeaderKey1);
    cy.get(selector.rewriteHeaderValue1).should('be.visible').type(data.rewriteHeaderValue1);
    cy.get(selector.rewriteHeaderKey2).should('be.visible').type(data.rewriteHeaderKey2);
    cy.get(selector.rewriteHeaderValue2).should('be.visible').type(data.rewriteHeaderValue2);

    cy.contains('Next').click();
    cy.get(selector.nodes_0_host).type(data.host2);
    cy.get(selector.nodes_0_port).type(data.port);
    cy.get(selector.nodes_0_weight).type(data.weight);
    cy.contains('Next').click();

    // should not see proxy-rewrite plugin in the step3
    cy.contains('proxy-rewrite').should('not.exist');
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess).should('be.visible');
  });

  it('should keep the same proxy-rewrite data in edit route page with the create data', function () {
    cy.visit('/');
    cy.contains(menuLocaleUS['menu.routes']).click();

    cy.get(selector.nameSelector).type(data.routeName);
    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('Configure').click();

    // NOTE: make sure all components rerender done
    cy.get('#status').should('have.class', 'ant-switch-checked');
    cy.get(selector.name).type(data.routeName);

    cy.contains(routeLocaleUS['page.route.form.itemLabel.newPath']).should('be.visible');
    cy.get(selector.newUri).should('have.value', data.rewriteUri);

    cy.get(selector.newHost).should('not.exist');

    cy.get(selector.methodRewriteSelect).contains('POST').should('exist');

    cy.get(selector.rewriteHeaderKey1).should('have.value', data.rewriteHeaderKey1);
    cy.get(selector.rewriteHeaderValue1).should('have.value', data.rewriteHeaderValue1);
    cy.get(selector.rewriteHeaderKey2).should('have.value', data.rewriteHeaderKey2);
    cy.get(selector.rewriteHeaderValue2).should('have.value', data.rewriteHeaderValue2);

    cy.contains('Next').click();
    cy.get(selector.nodes_0_host).should('have.value', data.host2);
    cy.contains('Next').click();

    // should not see proxy-rewrite plugin in the step3
    cy.contains('proxy-rewrite').should('not.exist');
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess).should('be.visible');
  });

  it('should use proxy rewrite in regex uri moode without template', () => {
    cy.visit('/');
    cy.contains(menuLocaleUS['menu.routes']).click();

    cy.get(selector.nameSelector).type(data.routeName);
    cy.contains('Search').click();
    cy.contains(data.routeName).siblings().contains('Configure').click();

    cy.get('#status').should('have.class', 'ant-switch-checked');
    cy.get(selector.regexUri).click();
    cy.get(selector.uriRewriteReg).should('be.visible').type(data.regex);
    cy.get(selector.uriRewriteTemp).should('have.value', '');
    cy.contains('Next').click();
    cy.get(selector.nodes_0_host).type(data.host2);
    cy.get(selector.nodes_0_port).type(data.port);
    cy.get(selector.nodes_0_weight).type(data.weight);
    cy.contains('Next').click();

    cy.contains('proxy-rewrite').should('not.exist');
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(data.submitSuccess).should('be.visible');
  });

  it('should delete the route', function () {
    cy.visit('/routes/list');
    cy.get(selector.nameSelector).type(data.routeName);
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
