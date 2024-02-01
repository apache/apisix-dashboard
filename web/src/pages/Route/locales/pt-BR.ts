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
  'page.route.button.returnList': 'Ir para lista',
  'page.route.button.send': 'Enviar',
  'page.route.onlineDebug': 'Depuração on-line',
  'page.route.pluginTemplateConfig': 'Configuração do modelo de plug-in',

  'page.route.parameterPosition': 'Posição do Parâmetro',
  'page.route.httpRequestHeader': 'Cabeçalho da solicitação HTTP',
  'page.route.requestParameter': 'Parâmetro de Solicitação',
  'page.route.postRequestParameter': 'Parâmetro de solicitação POST',
  'page.route.builtinParameter': 'Parâmetro embutido',
  'page.route.parameterName': 'Nome do parâmetro',
  'page.route.operationalCharacter': 'Personagem Operacional',
  'page.route.equal': 'Igual(==)',
  'page.route.unequal': 'Diferente(~=)',
  'page.route.greaterThan': 'Maior que (>)',
  'page.route.lessThan': 'Menos de (<)',
  'page.route.regexMatch': 'Correspondência Regex (~~)',
  'page.route.caseInsensitiveRegexMatch':
    'Correspondência regular que não diferencia maiúsculas de minúsculas (~*)',
  'page.route.in': 'EM',
  'page.route.has': 'TEM',
  'page.route.reverse': 'Inverta o resultado (!)',
  'page.route.rule': 'Regra',
  'page.route.httpHeaderName': 'Nome do cabeçalho da solicitação HTTP',
  'page.route.service': 'Serviço',
  'page.route.instructions': 'Instruções',
  'page.route.import': 'Importar',
  'page.route.createRoute': 'Criar rota',
  'page.route.editRoute': 'Configurar Rota',
  'page.route.batchDeletion': 'Excluir rotas em lote',
  'page.route.unSelect': 'Desmarcar',
  'page.route.item': 'itens',
  'page.route.chosen': 'escolhido',

  'page.route.input.placeholder.parameterNameHttpHeader':
    'Nome do cabeçalho da solicitação, por exemplo: HOST',
  'page.route.input.placeholder.parameterNameRequestParameter':
    'Nome do parâmetro, por exemplo: id',
  'page.route.input.placeholder.requestUrl': 'insira o URL de solicitação válido',
  'page.route.input.placeholder.paramKey': 'Chave de parâmetro',
  'page.route.input.placeholder.paramValue': 'Valor do parâmetro',
  'page.route.input.placeholder.paramType': 'Tipo de parâmetro',

  'page.route.form.itemRulesRequiredMessage.parameterName':
    'Apenas letras e números são suportados e só podem começar com letras',
  'page.route.value': 'Valor do parâmetro',
  'page.route.panelSection.title.advancedMatchRule':
    'Condições Avançadas de Correspondência de Roteamento',

  'page.route.panelSection.title.nameDescription': 'Nome e descrição',
  'page.route.form.itemRulesPatternMessage.apiNameRule':
    'O comprimento máximo deve ser de apenas 100',

  'page.route.panelSection.title.requestConfigBasicDefine': 'Solicitar Definição Básica',
  'page.route.form.itemLabel.httpMethod': 'Métodos HTTP',
  'page.route.form.itemLabel.scheme': 'Esquema',
  'page.route.form.itemLabel.priority': 'Prioridade',
  'page.route.form.itemLabel.redirect': 'Redirecionar',
  'page.route.select.option.enableHttps': 'Ativar HTTPS',
  'page.route.select.option.configCustom': 'Personalizado',
  'page.route.select.option.forbidden': 'Proibido',
  'page.route.form.itemLabel.redirectCustom': 'Redirecionamentos personalizados',
  'page.route.input.placeholder.redirectCustom': 'Por exemplo: /foo/index.html',
  'page.route.select.option.redirect301': '301(Permanent Redirect)',
  'page.route.select.option.redirect302': '302(Temporary Redirect)',
  'page.route.form.itemLabel.username': 'Nome de usuário',
  'page.route.form.itemLabel.password': 'Senha',
  'page.route.form.itemLabel.token': 'Token',
  'page.route.form.itemLabel.apikey': 'Apikey',

  'page.route.form.itemExtraMessage.domain':
    'Nome de domínio ou IP, suporte para nome de domínio genérico, por exemplo: *.test.com',
  'page.route.form.itemRulesPatternMessage.domain':
    'Apenas letras, números, -,_ e * são suportados, mas * precisa estar no início.',
  'page.route.form.itemExtraMessage1.path':
    'Caminho de solicitação HTTP, por exemplo: /foo/index.html, suporta o prefixo de caminho de solicitação /foo/* ; /* representa todos os caminhos',
  'page.route.form.itemRulesPatternMessage.remoteAddrs':
    'Insira um endereço IP válido, por exemplo: 192.168.1.101, 192.168.1.0/24, ::1, fe80::1, fe80::1/64',
  'page.route.form.itemExtraMessage1.remoteAddrs':
    'IP do cliente, por exemplo: 192.168.1.101, 192.168.1.0/24, ::1, fe80::1, fe80::1/64',

  'page.route.httpAction': 'Ação',
  'page.route.httpOverrideOrCreate': 'Substituir/Criar',
  'page.route.panelSection.title.httpOverrideRequestHeader':
    'Substituir cabeçalho de solicitação HTTP',
  'page.route.status': 'Status',
  'page.route.groupName': 'Nome do grupo',
  'page.route.offline': 'Offline',
  'page.route.publish': 'Publicar',
  'page.route.published': 'Publicado',
  'page.route.unpublished': 'Não publicado',

  'page.route.select.option.inputManually': 'Inserir manualmente',
  'page.route.select.option.methodRewriteNone': 'Não modificar',
  'page.route.form.itemLabel.domainNameOrIp': 'Nome de domínio/IP',
  'page.route.form.itemExtraMessage.domainNameOrIp':
    'Ao usar Domain Name, ele irá analisar o local: /etc/resolv.conf por padrão',
  'page.route.portNumber': 'Número da porta',
  'page.route.weight': 'Peso',
  'page.route.radio.staySame': 'Continue o mesmo',
  'page.route.form.itemLabel.newPath': 'novo caminho',
  'page.route.form.itemLabel.newHost': 'Novo host',
  'page.route.form.itemLabel.regex': 'Regexp',
  'page.route.form.itemLabel.template': 'Template',
  'page.route.form.itemLabel.URIRewriteType': 'Substituição de URI',
  'page.route.form.itemLabel.hostRewriteType': 'Substituição do host',
  'page.route.form.itemLabel.methodRewrite': 'Substituição de método',
  'page.route.form.itemLabel.redirectURI': 'URIs de redirecionamento',
  'page.route.input.placeholder.newPath': 'Por exemplo: /foo/bar/index.html',

  'page.route.steps.stepTitle.defineApiRequest': 'Definir solicitação de API',
  'page.route.steps.stepTitle.defineApiBackendServe': 'Definir servidor de back-end da API',

  'page.route.popconfirm.title.offline': 'Tem certeza de que esta rota está off-line?',
  'page.route.radio.static': 'Estático',
  'page.route.radio.regex': 'Regex',
  'page.route.form.itemLabel.from': 'De',
  'page.route.form.itemHelp.status':
    'Se uma rota pode ser usada depois de criada, o valor padrão é false.',

  'page.route.host': 'Host',
  'page.route.path': 'Path',
  'page.route.remoteAddrs': 'Endereços remotos',
  'page.route.PanelSection.title.defineRequestParams': 'Definir parâmetros de solicitação',
  'page.route.PanelSection.title.responseResult': 'Resultado da resposta',
  'page.route.debug.showResultAfterSendRequest': 'Mostrar resultado após enviar solicitação',
  'page.route.TabPane.queryParams': 'Parâmetros de consulta',
  'page.route.TabPane.bodyParams': 'Parâmetros do corpo',
  'page.route.TabPane.headerParams': 'Parâmetros do Cabeçalho',
  'page.route.TabPane.authentication': 'Autenticação',
  'page.route.TabPane.response': 'Resposta',
  'page.route.TabPane.header': 'Cabeçalho de resposta',
  'page.route.debugWithoutAuth': 'Esta solicitação não usa nenhuma autorização.',
  'page.route.button.exportOpenApi': 'Exportar OpenAPI',
  'page.route.exportRoutesTips': 'Escolha o tipo de arquivo que deseja exportar',
  'page.route.button.importOpenApi': 'Importar OpenAPI',
  'page.route.button.selectFile': 'Selecione o arquivo',
  'page.route.list': 'Rotas',
  'page.route.panelSection.title.requestOverride': 'Substituição de Solicitação',
  'page.route.form.itemLabel.headerRewrite': 'Substituição de Cabeçalho',
  'page.route.tooltip.pluginOrchOnlySupportChrome':
    'A orquestração de plug-in é compatível apenas com o Chrome.',
  'page.route.tooltip.pluginOrchWithoutProxyRewrite':
    'O modo de orquestração de plug-in não pode ser usado quando a substituição de solicitação é configurada na Etapa 1.',
  'page.route.tooltip.pluginOrchWithoutRedirect':
    'O modo de orquestração de plug-in não pode ser usado quando Redirecionar na Etapa 1 é selecionado para habilitar HTTPS.',

  'page.route.tabs.normalMode': 'Normal',
  'page.route.tabs.orchestration': 'Orquestração',

  'page.route.list.description':
    'A rota é o ponto de entrada de uma solicitação, que define as regras de correspondência entre uma solicitação do cliente e um serviço. Uma rota pode ser associada a um serviço (Service), um upstream (Upstream), um serviço pode corresponder a um conjunto de rotas e uma rota pode corresponder a um objeto upstream (um conjunto de nós de serviço de back-end), portanto, cada solicitação correspondente para uma rota será feito proxy pelo gateway para o serviço upstream vinculado à rota.',

  'page.route.configuration.name.rules.required.description': 'Por favor, insira o nome da rota',
  'page.route.configuration.name.placeholder': 'Por favor, insira o nome da rota',
  'page.route.configuration.desc.tooltip': 'Por favor, insira a descrição da rota',
  'page.route.configuration.publish.tooltip':
    'Usado para controlar se uma rota é publicada no gateway imediatamente após sua criação',
  'page.route.configuration.version.placeholder': 'Insira o número da versão de roteamento',
  'page.route.configuration.version.tooltip': 'Número da versão da rota, por exemplo, V1',
  'page.route.configuration.normal-labels.tooltip':
    'Adicione rótulos personalizados a rotas que podem ser usadas para agrupamento de rotas.',

  'page.route.configuration.path.rules.required.description':
    'Insira um caminho de solicitação HTTP válido',
  'page.route.configuration.path.placeholder': 'Insira o caminho da solicitação HTTP',
  'page.route.configuration.remote_addrs.placeholder': 'Insira o endereço do cliente',
  'page.route.configuration.host.placeholder': 'Insira o nome do host da solicitação HTTP',

  'page.route.service.none': 'Nenhum',

  'page.route.rule.create': 'Criar regra',
  'page.route.rule.edit': 'Configurar regras',

  'page.route.advanced-match.operator.sample.IN': 'Insira uma matriz, por exemplo ["1", "2"]',
  'page.route.advanced-match.operator.sample.~~':
    'Insira uma expressão regular, por exemplo [a-z]+',
  'page.route.fields.service_id.invalid': 'Verifique a configuração do serviço de ligação',
  'page.route.fields.service_id.without-upstream':
    'Se você não vincular o serviço, deverá definir o Upstream (Etapa 2)',
  'page.route.advanced-match.tooltip':
    'Ele oferece suporte à correspondência de rota por meio de cabeçalhos de solicitação, parâmetros de solicitação e cookies e pode ser aplicado a cenários como publicação em escala de cinza e teste azul-verde.',
  'page.route.advanced-match.message': 'Pontas',
  'page.route.advanced-match.tips.requestParameter':
    'Parâmetro de solicitação: Consulta da URL da solicitação',
  'page.route.advanced-match.tips.postRequestParameter':
    'Parâmetro de solicitação POST: suporta apenas o formulário x-www-form-urlencoded',
  'page.route.advanced-match.tips.builtinParameter':
    'Parâmetros integrados: parâmetros internos do Nginx',

  'page.route.fields.custom.redirectOption.tooltip':
    'Isso está relacionado ao plug-in de redirecionamento',
  'page.route.fields.service_id.tooltip':
    'Vincular objetos de serviço para reutilizar sua configuração.',

  'page.route.fields.vars.invalid':
    'Verifique a configuração avançada da condição de correspondência',
  'page.route.fields.vars.in.invalid':
    'When using the IN operator, enter the parameter values in array format.',

  'page.route.data_loader.import': 'Importar',
  'page.route.data_loader.import_panel': 'Importar dados',
  'page.route.data_loader.types.openapi3': 'OpenAPI 3',
  'page.route.data_loader.types.openapi_legacy': 'OpenAPI 3 Legada',
  'page.route.data_loader.labels.loader_type': 'Tipo de dados carregados',
  'page.route.data_loader.labels.task_name': 'Nome da tarefa',
  'page.route.data_loader.labels.upload': 'Upload',
  'page.route.data_loader.labels.openapi3_merge_method': 'Mesclar métodos HTTP',
  'page.route.data_loader.tips.select_type': 'Selecione o carregador de dados',
  'page.route.data_loader.tips.input_task_name': 'Insira o nome da tarefa de importação',
  'page.route.data_loader.tips.click_upload': 'Clique para Carregar',
  'page.route.data_loader.tips.openapi3_merge_method':
    'Se deve mesclar vários métodos HTTP no caminho OpenAPI em uma única rota. Quando você tem vários métodos HTTP em seu caminho com configurações de detalhes diferentes (por exemplo, securitySchema), pode desativar essa opção para gerá-los em várias rotas.',
};
