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
import actionBarUS from '../../../src/components/ActionBar/locales/en-US';
import componentLocaleUS from '../../../src/locales/en-US/component';
import menuLocaleUS from '../../../src/locales/en-US/menu';
import routeLocaleUS from '../../../src/pages/Route/locales/en-US';

context('import and export routes', () => {
  const domSelector = {
    route_name: '#name',
    nodes_0_host: '#nodes_0_host',
  }
  const data = {
    route_name_0: 'route_name_0',
    route_name_1: 'route_name_1',
    upstream_node0_host_0: '1.1.1.1',
    upstream_node0_host_1: '2.2.2.2',
    importErrorMsg: 'required file type is .yaml, .yml or .json but got: .txt',
  }

  const uploadRouteFiles = ['../../../api/test/testdata/import/default.json','../../../api/test/testdata/import/default.yaml','import-error.txt']
  beforeEach(() => {
    // init login
    cy.login();
    cy.fixture('selector.json').as('domSelector');
  });
  /* it('should create route1 and route2', () => {
    //  go to route create page
    cy.visit('/');
    // create two routes
    for (let i=0; i<2; i += 1) {
      cy.contains(menuLocaleUS['menu.routes']).click();
      cy.contains(componentLocaleUS['component.global.create']).click();
      // input name, click Next
      cy.get(domSelector.route_name).type(data[`route_name_${i}`]);
      cy.contains(actionBarUS['component.actionbar.button.nextStep']).click();
      // input nodes_0_host, click Next
      cy.get(domSelector.nodes_0_host).type(data[`upstream_node0_host_${i}`])
      cy.contains(actionBarUS['component.actionbar.button.nextStep']).click();
      // do not config plugins, click Next
      cy.contains(actionBarUS['component.actionbar.button.nextStep']).click();
      // click submit to create route
      cy.contains(componentLocaleUS['component.global.submit']).click();
      // submit successfully
      cy.contains(`${componentLocaleUS['component.global.submit']} ${componentLocaleUS['component.status.success']}`);
    }
  });
  it('should export route: route_name_0, route_name_1', () => {
    cy.visit('/');
    cy.contains('Route').click();
    // select two routes in the list
    for (let i=0; i<2; i += 1) {
      cy.contains(data[`route_name_${i}`]).prev().click();
    }
    // click Export OpenAPI Button
    cy.contains(routeLocaleUS['page.route.button.exportOpenApi']).click();
    // click Confirm button in the popup
    cy.contains(componentLocaleUS['component.global.confirm']).click();
    // download a json files
    // down load a yaml files
  });
   */
  it('should import route(s) from be test files', () => {
    cy.visit('/');
    cy.contains('Route').click();
    
    uploadRouteFiles.forEach((file) => {
      // click import button
      cy.contains(routeLocaleUS['page.route.button.importOpenApi']).click();
      // select file
      cy.get('[type=file]').attachFile(file);
      // click submit
      cy.contains(componentLocaleUS['component.global.confirm']).click();
      // show upload notification
      if (file === 'import-error.txt') {
        // show error msg
        cy.get('.ant-notification-notice-description').should('contain', data.importErrorMsg);
        // close modal
        cy.contains(componentLocaleUS['component.global.cancel']).click();
      } else {
        cy.get('.ant-notification-notice-message').should('contain', `${routeLocaleUS['page.route.button.importOpenApi']} ${componentLocaleUS['component.status.success']}`);
        cy.get('.ant-notification-close-icon').click();
        // delete route just imported
        cy.contains(componentLocaleUS['component.global.delete']).click();
        cy.contains(componentLocaleUS['component.global.confirm']).click();
        // show delete successfully notification
        cy.get('.ant-notification-notice-message').should('contain', `${componentLocaleUS['component.global.delete']} ${menuLocaleUS['menu.routes']} ${componentLocaleUS['component.status.success']}`);
        cy.get('.ant-notification-close-icon').click();
      }
      
    })
    
  });
});