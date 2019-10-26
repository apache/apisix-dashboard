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
    dashboard: 'Panel de control',
    documentation: 'Documentación',
    guide: 'Guía',
    permission: 'Permisos',
    icons: 'Iconos',
    components: 'Componentes',
    charts: 'Gráficos',
    barChart: 'Bar Chart',
    lineChart: 'Gráfico de líneas',
    mixedChart: 'Mixed Chart',
    table: 'Tabla',
    tab: 'Pestaña',
    form: 'Formulario',
    page404: '404',
    errorLog: 'Registro de errores',
    mergeHeader: 'Merge Header',
    pdf: 'PDF',
    theme: 'Tema',
    i18n: 'I18n',
    profile: 'Profile'
  },
  navbar: {
    logOut: 'Salir',
    dashboard: 'Panel de control',
    github: 'Github',
    theme: 'Tema',
    size: 'Tamaño global',
    profile: 'Profile'
  },
  login: {
    title: 'Formulario de acceso',
    logIn: 'Acceso',
    username: 'Usuario',
    password: 'Contraseña',
    any: 'nada',
    thirdparty: 'Conectar con',
    thirdpartyTips: 'No se puede simular en local, así que combine su propia simulación de negocios. ! !'
  },
  documentation: {
    documentation: 'Documentación',
    github: 'Repositorio Github'
  },
  permission: {
    createRole: 'Nuevo rol',
    editPermission: 'Permiso de edición',
    roles: 'Tus permisos',
    switchRoles: 'Cambiar permisos',
    tips: 'In some cases it is not suitable to use v-permission, such as element Tab component or el-table-column and other asynchronous rendering dom cases which can only be achieved by manually setting the v-if.',
    delete: 'Borrar',
    confirm: 'Confirmar',
    cancel: 'Cancelar'
  },
  guide: {
    description: 'The guide page is useful for some people who entered the project for the first time. You can briefly introduce the features of the project. Demo is based on ',
    button: 'Ver guía'
  },
  components: {
    documentation: 'Documentación',
    stickyTips: 'when the page is scrolled to the preset position will be sticky on the top.',
    imageUploadTips: 'Since I was using only the vue@1 version, and it is not compatible with mockjs at the moment, I modified it myself, and if you are going to use it, it is better to use official version.'
  },
  table: {
    dynamicTips1: 'Fixed header, sorted by header order',
    dynamicTips2: 'Not fixed header, sorted by click order',
    dragTips1: 'Orden por defecto',
    dragTips2: 'The after dragging order',
    title: 'Título',
    importance: 'Importancia',
    type: 'Tipo',
    remark: 'Remark',
    search: 'Buscar',
    add: 'Añadir',
    export: 'Exportar',
    reviewer: 'Reviewer',
    id: 'ID',
    date: 'Fecha',
    author: 'Autor',
    readings: 'Lector',
    status: 'Estado',
    actions: 'Acciones',
    edit: 'Editar',
    publish: 'Publicar',
    draft: 'Draft',
    delete: 'Eliminar',
    cancel: 'Cancelar',
    confirm: 'Confirmar'
  },
  errorLog: {
    tips: 'Please click the bug icon in the upper right corner',
    description: 'Now the management system are basically the form of the spa, it enhances the user experience, but it also increases the possibility of page problems, a small negligence may lead to the entire page deadlock. Fortunately Vue provides a way to catch handling exceptions, where you can handle errors or report exceptions.',
    documentation: 'Documento de introducción'
  },
  pdf: {
    tips: 'Here we use window.print() to implement the feature of downloading PDF.'
  },
  theme: {
    change: 'Cambiar tema',
    documentation: 'Documentación del tema',
    tips: 'Tips: It is different from the theme-pick on the navbar is two different skinning methods, each with different application scenarios. Refer to the documentation for details.'
  },
  tagsView: {
    refresh: 'Actualizar',
    close: 'Cerrar',
    closeOthers: 'Cerrar otros',
    closeAll: 'Cerrar todos'
  },
  settings: {
    title: 'Page style setting',
    theme: 'Theme Color',
    showTagsView: 'Show Tags-View',
    showSidebarLogo: 'Show Sidebar Logo',
    fixedHeader: 'Fixed Header',
    sidebarTextTheme: 'Sidebar Text Theme'
  }
}
