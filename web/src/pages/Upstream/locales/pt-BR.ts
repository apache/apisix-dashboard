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
  'page.upstream.step.select.upstream': 'Upstream',
  'page.upstream.step.select.upstream.select.option': 'Personalizado',
  'page.upstream.step.select.upstream.select.option.serviceSelected':
    'Personalizado (a configuração atual substituirá o serviço vinculado)',
  'page.upstream.step.select.upstream.select.none': 'Nenhum',
  'page.upstream.step.backend.server.domain.or.ip': 'Host/IP do servidor de back-end',
  'page.upstream.form.item-label.node.domain.or.ip': 'Alvos',
  'page.upstream.step.input.domain.name.or.ip': 'Por favor, insira o domínio ou IP',
  'page.upstream.step.valid.domain.name.or.ip': 'Insira um domínio ou IP válido',
  'page.upstream.step.domain.name.or.ip': 'Nome do host ou IP',
  'page.upstream.step.host': 'Host',
  'page.upstream.step.input.port': 'Insira o número da porta',
  'page.upstream.step.port': 'Porta',
  'page.upstream.step.input.weight': 'Por favor, insira o peso',
  'page.upstream.step.weight': 'Peso',
  'page.upstream.step.create': 'Criar',
  'page.upstream.step.name': 'Nome',
  'page.upstream.step.name.should.unique': 'O nome deve ser único',
  'page.upstream.step.input.upstream.name': 'Insira o nome do upstream',
  'page.upstream.step.description': 'Descrição',
  'page.upstream.step.input.description': 'Insira a descrição do upstream',
  'page.upstream.step.type': 'Algoritmos',
  'page.upstream.step.pass-host': 'Hostname',
  'page.upstream.step.pass-host.pass': 'Mantenha o mesmo host da solicitação do cliente',
  'page.upstream.step.pass-host.node': 'Use o domínio ou IP da lista de nós',
  'page.upstream.step.pass-host.rewrite': 'Host personalizado (será obsoleto no futuro)',
  'page.upstream.step.pass-host.upstream_host': 'Host personalizado',
  'page.upstream.step.connect.timeout': 'Tempo limite de conexão',
  'page.upstream.step.connect.timeout.desc':
    'Tempo limite para estabelecer uma conexão da solicitação para o servidor upstream',
  'page.upstream.step.input.connect.timeout': 'Insira o tempo limite de conexão',
  'page.upstream.step.send.timeout': 'Tempo limite de envio',
  'page.upstream.step.send.timeout.desc': 'Tempo limite para enviar dados para servidores upstream',
  'page.upstream.step.input.send.timeout': 'Insira o tempo limite de envio',
  'page.upstream.step.read.timeout': 'Tempo de leitura esgotado',
  'page.upstream.step.read.timeout.desc': 'Tempo limite para receber dados de servidores upstream',
  'page.upstream.step.input.read.timeout': 'Insira o tempo limite de leitura',
  'page.upstream.step.healthyCheck.healthy.check': 'Exame de saúde',
  'page.upstream.step.healthyCheck.healthy': 'Saudável',
  'page.upstream.step.healthyCheck.unhealthy': 'Pouco saudável',
  'page.upstream.step.healthyCheck.healthy.status': 'Estado saudável',
  'page.upstream.step.healthyCheck.unhealthyStatus': 'Estado não saudável',
  'page.upstream.step.healthyCheck.active': 'Ativo',
  'page.upstream.step.healthyCheck.active.timeout': 'Tempo esgotado',
  'page.upstream.step.input.healthyCheck.active.timeout': 'Insira o tempo limite',
  'page.upstream.step.input.healthyCheck.activeInterval': 'Insira o intervalo',
  'page.upstream.step.input.healthyCheck.active.req_headers': 'Insira os cabeçalhos da solicitação',
  'page.upstream.step.healthyCheck.passive': 'Passivo',
  'page.upstream.step.healthyCheck.passive.http_statuses': 'Status HTTP',
  'page.upstream.step.input.healthyCheck.passive.http_statuses': 'Insira o status http',
  'page.upstream.step.healthyCheck.passive.tcp_failures': 'Falhas de TCP',
  'page.upstream.step.input.healthyCheck.passive.tcp_failures': 'Insira falhas de TCP',
  'page.upstream.step.keepalive_pool': 'Keepalive Pool',
  'page.upstream.notificationMessage.enableHealthCheckFirst':
    'Ative a verificação de integridade primeiro.',
  'page.upstream.upstream_host.required': 'Insira o host personalizado',

  'page.upstream.create': 'Criar upstream',
  'page.upstream.configure': 'Configurar upstream',
  'page.upstream.create.upstream.successfully': 'Upstream criado com sucesso',
  'page.upstream.edit.upstream.successfully': 'Upstream configurado com sucesso',
  'page.upstream.create.basic.info': 'Informação básica',
  'page.upstream.create.preview': 'Visualização',

  'page.upstream.list.id': 'ID',
  'page.upstream.list.name': 'Nome',
  'page.upstream.list.type': 'Tipo',
  'page.upstream.list.description': 'Descrição',
  'page.upstream.list.edit.time': 'Tempo de atualização',
  'page.upstream.list.operation': 'Operações',
  'page.upstream.list.edit': 'Configurar',
  'page.upstream.list.confirm.delete': 'Você tem certeza que quer deletar?',
  'page.upstream.list.confirm': 'Confirme',
  'page.upstream.list.cancel': 'Cancelar',
  'page.upstream.list.delete.successfully': 'Upstream removido com sucesso',
  'page.upstream.list.delete': 'Excluir',
  'page.upstream.list': 'Lista upstream',
  'page.upstream.list.input': 'Por favor, insira',
  'page.upstream.list.create': 'Criar',

  'page.upstream.type.roundrobin': 'Round Robin',
  'page.upstream.type.chash': 'CHash',
  'page.upstream.type.ewma': 'EWMA',
  'page.upstream.type.least_conn': 'Least conn',

  'page.upstream.list.content':
    'A lista upstream contém os serviços upstream criados (ou seja, serviços de back-end) e permite balanceamento de carga e verificação de integridade de vários nós de destino dos serviços upstream.',

  'page.upstream.checks.active.timeout.description':
    'Tempo limite de soquete para verificações ativas (em segundos)',
  'page.upstream.checks.active.unhealthy.interval.description':
    'Intervalo entre as verificações de alvos não íntegros (em segundos)',
  'page.upstream.checks.passive.healthy.http_statuses.description':
    'Quais status HTTP considerar um sucesso',
  'page.upstream.checks.passive.unhealthy.http_statuses.description':
    'Quais status HTTP considerar uma falha',
  'page.upstream.checks.passive.unhealthy.http_failures.description':
    'Número de falhas de HTTP para considerar um destino não íntegro',
  'page.upstream.checks.passive.unhealthy.tcp_failures.description':
    'Número de falhas de TCP para considerar um destino não íntegro',
  'page.upstream.scheme': 'Esquema',

  'page.upstream.other.configuration.invalid': 'Verifique a configuração Upstream',
};
