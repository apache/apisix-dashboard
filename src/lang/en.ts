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

export default {
  route: {
    dashboard: 'Dashboard',
    documentation: 'Documentation',
    guide: 'Guide',
    permission: 'Permission',
    icons: 'Icons',
    components: 'Components',
    charts: 'Charts',
    barChart: 'Bar Chart',
    lineChart: 'Line Chart',
    mixedChart: 'Mixed Chart',
    table: 'Table',
    tab: 'Tab',
    form: 'Form',
    page404: '404',
    errorLog: 'Error Log',
    mergeHeader: 'Merge Header',
    pdf: 'PDF',
    theme: 'Theme',
    i18n: 'I18n',
    profile: 'Profile',
    SchemaRoutes: 'Routes',
    SchemaRoutesList: 'Routes',
    SchemaRoutesEdit: 'Router Edit',
    SchemaRoutesCreate: 'Router Create',
    SchemaConsumers: 'Consumers',
    SchemaConsumersList: 'Consumers',
    SchemaConsumersEdit: 'Consumer Edit',
    SchemaConsumersCreate: 'Consumer Create',
    SchemaServices: 'Services',
    SchemaServiceList: 'Services',
    SchemaServiceCreate: 'Service Create',
    SchemaServiceEdit: 'Service Edit',
    SchemaSSL: 'SSL',
    SchemaSSLList: 'SSL',
    SchemaSSLEdit: 'SSL Edit',
    SchemaSSLCreate: 'SSL Create',
    SchemaUpstream: 'Upstream',
    SchemaUpstreamList: 'Upstream',
    SchemaUpstreamCreate: 'Upstream Create',
    SchemaUpstreamEdit: 'Upstream Edit'
  },
  navbar: {
    logOut: 'Log Out',
    dashboard: 'Dashboard',
    github: 'Github',
    theme: 'Theme',
    size: 'Global Size',
    profile: 'Profile'
  },
  login: {
    title: 'APISIX Login',
    logIn: 'Login',
    username: 'Username',
    password: 'Password',
    any: 'any',
    thirdparty: 'Or connect with',
    thirdpartyTips: 'Can not be simulated on local, so please combine you own business simulation! ! !'
  },
  documentation: {
    documentation: 'Documentation',
    github: 'Github Repository'
  },
  permission: {
    createRole: 'New Role',
    editPermission: 'Edit',
    roles: 'Your roles',
    switchRoles: 'Switch roles',
    tips: 'In some cases, using v-permission will have no effect. For example: Element-UI  el-tab or el-table-column and other scenes that dynamically render dom. You can only do this with v-if.',
    delete: 'Delete',
    confirm: 'Confirm',
    cancel: 'Cancel'
  },
  guide: {
    description: 'The guide page is useful for some people who entered the project for the first time. You can briefly introduce the features of the project. Demo is based on ',
    button: 'Show Guide'
  },
  components: {
    documentation: 'Documentation',
    stickyTips: 'when the page is scrolled to the preset position will be sticky on the top.',
    imageUploadTips: 'Since I was using only the vue@1 version, and it is not compatible with mockjs at the moment, I modified it myself, and if you are going to use it, it is better to use official version.'
  },
  table: {
    dynamicTips1: 'Fixed header, sorted by header order',
    dynamicTips2: 'Not fixed header, sorted by click order',
    dragTips1: 'The default order',
    dragTips2: 'The after dragging order',
    title: 'Title',
    importance: 'Importance',
    type: 'Type',
    remark: 'Remark',
    search: 'Search',
    add: 'Add',
    export: 'Export',
    reviewer: 'Reviewer',
    id: 'ID',
    date: 'Date',
    author: 'Author',
    readings: 'Readings',
    status: 'Status',
    actions: 'Actions',
    edit: 'Edit',
    publish: 'Publish',
    draft: 'Draft',
    delete: 'Delete',
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
  errorLog: {
    tips: 'Please click the bug icon in the upper right corner',
    description: 'Now the management system are basically the form of the spa, it enhances the user experience, but it also increases the possibility of page problems, a small negligence may lead to the entire page deadlock. Fortunately Vue provides a way to catch handling exceptions, where you can handle errors or report exceptions.',
    documentation: 'Document introduction'
  },
  pdf: {
    tips: 'Here we use window.print() to implement the feature of downloading PDF.'
  },
  theme: {
    change: 'Change Theme',
    documentation: 'Theme documentation',
    tips: 'Tips: It is different from the theme-pick on the navbar is two different skinning methods, each with different application scenarios. Refer to the documentation for details.'
  },
  tagsView: {
    refresh: 'Refresh',
    close: 'Close',
    closeOthers: 'Close Others',
    closeAll: 'Close All'
  },
  settings: {
    title: 'Page style setting',
    theme: 'Theme Color',
    showTagsView: 'Open Tags-View',
    showSidebarLogo: 'Sidebar Logo',
    fixedHeader: 'Fixed Header',
    sidebarTextTheme: 'Sidebar Text Theme'
  },
  button: {
    save: 'Save',
    cancel: 'Cancel',
    add_plugin: 'Add Plugin',
    add_node: 'Add Node',
    delete: 'Delete',
    addValue: 'Add Value'
  }
}
