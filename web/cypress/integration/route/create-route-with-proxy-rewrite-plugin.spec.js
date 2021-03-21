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
import menuLocaleUS from '../../../src/locales/en-US/menu';
import componentLocaleUS from '../../../src/locales/en-US/component';
import routeLocaleUS from '../../../src/pages/Route/locales/en-US';

context('create route with proxy-rewrite plugin', () => {
  const data = {
    rewriteUri: '/get',
    rewriteHeaderKey1: 'test1',
    rewriteHeaderKey2: 'test2',
    rewriteHeaderValue1: '1',
    rewriteHeaderValue2: '2',
  };

  const domSelector = {
    staticUri: '[data-cy=uri-static]',
    staticHost: '[data-cy=host-static]',
    keepHost: '[data-cy=host-keep]',
    newUri: '#proxyRewrite_uri',
    uriRewriteReg: '#proxyRewrite_regex_uri_0',
    uriRewriteTemp: '#proxyRewrite_regex_uri_1',
    newHost: '#proxyRewrite_host',
    buttonCreateNewRewriteHeader: '[data-cy=create-new-rewrite-header]',
    rewriteHeaderKey1: '#proxyRewrite_kvHeaders_0_key',
    rewriteHeaderValue1: '#proxyRewrite_kvHeaders_0_value',
    rewriteHeaderKey2: '#proxyRewrite_kvHeaders_1_key',
    rewriteHeaderValue2: '#proxyRewrite_kvHeaders_1_value',
  }

  beforeEach(() => {
    cy.login();

    cy.fixture('selector.json').as('domSelector');
    cy.fixture('data.json').as('data');
  });

  it('should create route with proxy-rewrite plugin', function () {
    cy.visit('/');
    cy.contains(menuLocaleUS['menu.routes']).click();

    // show create page
    cy.contains(componentLocaleUS['component.global.create']).click();
    cy.get(this.domSelector.name).type(this.data.routeName);

    // show requestOverride PanelSection
    cy.contains(routeLocaleUS['page.route.panelSection.title.requestOverride']).should('be.visible');
    // should show newPath after the URIRewriteType static clicked
    cy.get(domSelector.staticUri).click();
    cy.contains(routeLocaleUS['page.route.form.itemLabel.newPath']).should('be.visible');
    cy.get(domSelector.newUri).should('be.visible').type(data.rewriteUri);
    // should show regexp and template after URIRewriteType regexp clicked
    cy.contains(routeLocaleUS['page.route.radio.regex']).click();
    cy.contains(routeLocaleUS['page.route.form.itemLabel.regex']).should('be.visible');
    cy.get(domSelector.uriRewriteReg).should('be.visible');
    cy.contains(routeLocaleUS['page.route.form.itemLabel.template']).should('be.visible');
    cy.get(domSelector.uriRewriteTemp).should('be.visible');

    cy.get(domSelector.staticUri).click();

    // should show newhost after static host clicked
    cy.get(domSelector.staticHost).click();
    cy.contains(routeLocaleUS['page.route.form.itemLabel.newHost']).should('be.visible');
    cy.get(domSelector.newHost).should('be.visible');
    cy.get(domSelector.keepHost).click();
    cy.get(domSelector.newHost).should('not.exist');

    // new header key value input after createNewRewriteHeader button clicked
    cy.get(domSelector.buttonCreateNewRewriteHeader).click();
    cy.get(domSelector.rewriteHeaderKey1).should('be.visible').type(data.rewriteHeaderKey1);
    cy.get(domSelector.rewriteHeaderValue1).should('be.visible').type(data.rewriteHeaderValue1);
    cy.get(domSelector.rewriteHeaderKey2).should('be.visible').type(data.rewriteHeaderKey2);
    cy.get(domSelector.rewriteHeaderValue2).should('be.visible').type(data.rewriteHeaderValue2);

    cy.contains('Next').click();
    cy.get(this.domSelector.nodes_0_host).type(this.data.host2);
    cy.contains('Next').click();

    // should not see proxy-rewrite plugin in the step3
    cy.contains('proxy-rewrite').should('not.exist');
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(this.data.submitSuccess).should('be.visible');
  });

  it('should keep the same proxy-rewrite data in edit route page with the create data', function () {
    cy.visit('/');
    cy.contains(menuLocaleUS['menu.routes']).click();

    cy.get(this.domSelector.nameSelector).type(this.data.routeName);
    cy.contains('Search').click();
    cy.contains(this.data.routeName).siblings().contains('Edit').click();
    cy.get(this.domSelector.name).type(this.data.routeName);

    cy.contains(routeLocaleUS['page.route.form.itemLabel.newPath']).should('be.visible');
    cy.get(domSelector.newUri).should('have.value',data.rewriteUri);

    cy.get(domSelector.newHost).should('not.exist');

    cy.get(domSelector.rewriteHeaderKey1).should('have.value', data.rewriteHeaderKey1);
    cy.get(domSelector.rewriteHeaderValue1).should('have.value', data.rewriteHeaderValue1);
    cy.get(domSelector.rewriteHeaderKey2).should('have.value', data.rewriteHeaderKey2);
    cy.get(domSelector.rewriteHeaderValue2).should('have.value', data.rewriteHeaderValue2);

    cy.contains('Next').click();
    cy.get(this.domSelector.nodes_0_host).should('have.value', this.data.host2);
    cy.contains('Next').click();

    // should not see proxy-rewrite plugin in the step3
    cy.contains('proxy-rewrite').should('not.exist');
    cy.contains('Next').click();
    cy.contains('Submit').click();
    cy.contains(this.data.submitSuccess).should('be.visible');
  });

  it('should delete the route', function () {
    cy.visit('/routes/list');
    cy.get(this.domSelector.nameSelector).type(this.data.routeName);
    cy.contains('Search').click();
    cy.contains(this.data.routeName).siblings().contains('Delete').click();
    cy.contains('button', 'Confirm').click();
    cy.get(this.domSelector.notification).should('contain', this.data.deleteRouteSuccess);
  });
});
