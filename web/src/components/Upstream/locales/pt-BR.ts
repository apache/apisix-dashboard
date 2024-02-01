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
  'component.upstream.fields.tls.client_key': 'Chave do cliente',
  'component.upstream.fields.tls.client_key.required': 'Insira a chave do cliente',
  'component.upstream.fields.tls.client_cert': 'Certificado de cliente',
  'component.upstream.fields.tls.client_cert.required': 'Insira o certificado do cliente',

  'component.upstream.fields.upstream_type': 'Tipo upstream',
  'component.upstream.fields.upstream_type.node': 'Nó',
  'component.upstream.fields.upstream_type.service_discovery': 'Descoberta de serviço',

  'component.upstream.fields.discovery_type': 'Tipo de Descoberta',
  'component.upstream.fields.discovery_type.tooltip': 'Tipo de Descoberta',
  'component.upstream.fields.discovery_type.placeholder': 'Selecione o tipo de descoberta',
  'component.upstream.fields.discovery_type.type.dns': 'DNS',
  'component.upstream.fields.discovery_type.type.consul': 'Consul',
  'component.upstream.fields.discovery_type.type.consul_kv': 'Consul KV',
  'component.upstream.fields.discovery_type.type.nacos': 'Nacos',
  'component.upstream.fields.discovery_type.type.eureka': 'Eureka',
  'component.upstream.fields.discovery_type.type.kubernetes': 'Kubernetes',

  'component.upstream.fields.discovery_args.group_name': 'Nome do grupo',
  'component.upstream.fields.discovery_args.group_name.tooltip': 'Nome do grupo',
  'component.upstream.fields.discovery_args.group_name.placeholder':
    'Por favor insira o nome do grupo',
  'component.upstream.fields.discovery_args.namespace_id': 'ID do espaço de nomes',
  'component.upstream.fields.discovery_args.namespace_id.tooltip': 'ID do espaço de nomes',
  'component.upstream.fields.discovery_args.namespace_id.placeholder': 'Insira o id do namespace',

  'component.upstream.fields.service_name': 'Nome do Serviço',
  'component.upstream.fields.service_name.tooltip': 'Nome do Serviço',
  'component.upstream.fields.service_name.placeholder': 'Insira o nome do serviço',

  'component.upstream.fields.scheme.tooltip.stream':
    'Este tipo é usado apenas para Stream Route, que é um proxy de camada 4. Referência: https://apisix.apache.org/docs/apisix/stream-proxy/',
  'component.upstream.fields.scheme.tooltip.pubsub':
    'Este tipo é usado apenas na assinatura de publicação. Referência: https://apisix.apache.org/docs/apisix/pubsub/',

  'component.upstream.fields.tls': 'TLS',
  'component.upstream.fields.tls.tooltip': 'Certificado TLS',

  'component.upstream.fields.hash_on': 'Hash on',
  'component.upstream.fields.hash_on.tooltip': 'O que usar como entrada de hash',

  'component.upstream.fields.key': 'Chave',
  'component.upstream.fields.key.tooltip': 'Chave como entrada de hash',

  'component.upstream.fields.retries': 'Novas tentativas',
  'component.upstream.fields.retries.tooltip':
    'O mecanismo de repetição envia a solicitação para o próximo nó upstream. Um valor de 0 desativa o mecanismo de repetição e deixa a tabela vazia para usar o número de nós de back-end disponíveis.',

  'component.upstream.fields.retry_timeout': 'Repetir tempo limite',
  'component.upstream.fields.retry_timeout.tooltip':
    'Configure um número para limitar a quantidade de segundos em que as novas tentativas podem ser continuadas e não continue as novas tentativas se a solicitação anterior e as solicitações de nova tentativa tiverem demorado muito. 0 significa desativar o mecanismo de tempo limite de repetição.',

  'component.upstream.fields.keepalive_pool': 'Keepalive Pool',
  'component.upstream.fields.keepalive_pool.tooltip':
    'Definir pool de keepalive independente para Upstream',
  'component.upstream.fields.keepalive_pool.size': 'Tamanho',
  'component.upstream.fields.keepalive_pool.size.placeholder': 'Por favor, insira o tamanho',
  'component.upstream.fields.keepalive_pool.idle_timeout': 'Tempo limite ocioso',
  'component.upstream.fields.keepalive_pool.idle_timeout.placeholder':
    'Insira o tempo limite de inatividade',
  'component.upstream.fields.keepalive_pool.requests': 'Solicitações',
  'component.upstream.fields.keepalive_pool.requests.placeholder': 'Por favor insira os pedidos',

  'component.upstream.fields.checks.active.type': 'Tipo',
  'component.upstream.fields.checks.active.type.tooltip':
    'Se deve executar verificações de integridade ativas usando HTTP ou HTTPS ou apenas tentar uma conexão TCP.',

  'component.upstream.fields.checks.active.concurrency': 'Simultaneidade',
  'component.upstream.fields.checks.active.concurrency.tooltip':
    'Número de destinos a serem verificados simultaneamente em verificações de integridade ativas.',

  'component.upstream.fields.checks.active.host': 'Host',
  'component.upstream.fields.checks.active.host.required': 'Por favor, insira o nome do host',
  'component.upstream.fields.checks.active.host.tooltip':
    'O nome do host da solicitação HTTP usada para executar a verificação de integridade ativa',
  'component.upstream.fields.checks.active.host.scope': 'Apenas letras, números e . são suportados',

  'component.upstream.fields.checks.active.port': 'Porta',

  'component.upstream.fields.checks.active.http_path': 'Caminho HTTP',
  'component.upstream.fields.checks.active.http_path.tooltip':
    'O caminho que deve ser usado ao emitir a solicitação HTTP GET para o destino. O valor padrão é /.',
  'component.upstream.fields.checks.active.http_path.placeholder':
    'Insira o caminho da solicitação HTTP',

  'component.upstream.fields.checks.active.https_verify_certificate':
    'Verifique o certificado HTTP',
  'component.upstream.fields.checks.active.https_verify_certificate.tooltip':
    'Se deve verificar a validade do certificado SSL do host remoto ao executar verificações de integridade ativas usando HTTPS.',

  'component.upstream.fields.checks.active.req_headers': 'Cabeçalhos de solicitação',
  'component.upstream.fields.checks.active.req_headers.tooltip':
    'Cabeçalhos de solicitação adicionais, exemplo: User-Agent: curl/7.29.0',

  'component.upstream.fields.checks.active.healthy.interval': 'Intervalo',
  'component.upstream.fields.checks.active.healthy.interval.tooltip':
    'Intervalo entre as verificações de alvos saudáveis (em segundos)',

  'component.upstream.fields.checks.active.healthy.successes': 'Sucessos',
  'component.upstream.fields.checks.active.healthy.successes.tooltip':
    'Número de sucessos para considerar um alvo saudável',
  'component.upstream.fields.checks.active.healthy.successes.required':
    'Por favor, insira o número de sucessos',

  'component.upstream.fields.checks.active.healthy.http_statuses': 'Status HTTP',
  'component.upstream.fields.checks.active.healthy.http_statuses.tooltip':
    'Uma matriz de status HTTP para considerar um sucesso, indicando integridade, quando retornado por uma investigação em verificações de integridade ativas.',

  'component.upstream.fields.checks.active.unhealthy.timeouts': 'Tempo limite',
  'component.upstream.fields.checks.active.unhealthy.timeouts.tooltip':
    'Número de tempos limite em investigações ativas para considerar um destino não íntegro.',

  'component.upstream.fields.checks.active.unhealthy.http_failures': 'Falhas de HTTP',
  'component.upstream.fields.checks.active.unhealthy.http_failures.tooltip':
    'Número de falhas de HTTP para considerar um destino não íntegro',
  'component.upstream.fields.checks.active.unhealthy.http_failures.required':
    'Insira as falhas de HTTP',

  'component.upstream.fields.checks.active.unhealthy.tcp_failures': 'Falhas de TCP',
  'component.upstream.fields.checks.active.unhealthy.tcp_failures.tooltip':
    'Número de falhas de TCP para considerar um destino não íntegro',
  'component.upstream.fields.checks.active.unhealthy.tcp_failures.required':
    'Insira as falhas de TCP',

  'component.upstream.fields.checks.active.unhealthy.interval': 'Intervalo',
  'component.upstream.fields.checks.active.unhealthy.interval.tooltip':
    'Intervalo entre verificações de integridade ativas para destinos não íntegros (em segundos). Um valor de zero indica que as sondagens ativas para alvos íntegros não devem ser executadas.',
  'component.upstream.fields.checks.active.unhealthy.required': 'Insira o intervalo não saudável',

  'component.upstream.fields.checks.passive.healthy.successes': 'Sucessos',
  'component.upstream.fields.checks.passive.healthy.successes.tooltip':
    'Número de sucessos para considerar um alvo saudável',
  'component.upstream.fields.checks.passive.healthy.successes.required':
    'Por favor, insira o número de sucessos',

  'component.upstream.fields.checks.passive.unhealthy.timeouts': 'Tempo limite',
  'component.upstream.fields.checks.passive.unhealthy.timeouts.tooltip':
    'Número de tempos limite no tráfego com proxy para considerar um destino não íntegro, conforme observado por verificações de integridade passivas.',

  'component.upstream.other.none': 'Nenhum (disponível apenas ao vincular o serviço)',
  'component.upstream.other.pass_host-with-multiple-nodes.title':
    'Verifique a configuração do nó de destino',
  'component.upstream.other.pass_host-with-multiple-nodes':
    'Ao usar um nome de host ou IP na lista de nós de destino, verifique se há apenas um nó de destino',
  'component.upstream.other.health-check.passive-only':
    'Quando a verificação de integridade passiva está habilitada, a verificação de integridade ativa precisa ser habilitada ao mesmo tempo.',
  'component.upstream.other.health-check.invalid':
    'Verifique a configuração da verificação de integridade',
};
