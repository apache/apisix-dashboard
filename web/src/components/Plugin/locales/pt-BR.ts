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
  'component.plugin.tip1':
    'NOTA: Depois de personalizar o plug-in, você precisa atualizar o schema.json.',
  'component.plugin.tip2': 'Como atualizar?',
  'component.select.pluginTemplate': 'Selecione um modelo de plug-in',
  'component.step.select.pluginTemplate.select.option': 'Personalizado',
  'component.plugin.pluginTemplate.tip1':
    '1. Quando uma rota já possui um campo de plugins configurado, os plugins no modelo de plugin serão mesclados a ele.',
  'component.plugin.pluginTemplate.tip2':
    '2. O mesmo plug-in no modelo de plug-in substituirá um dos plug-ins.',
  'component.plugin.enable': 'Habilitar',
  'component.plugin.disable': 'Editar',
  'component.plugin.authentication': 'Autenticação',
  'component.plugin.security': 'Segurança',
  'component.plugin.traffic': 'Controle de tráfego',
  'component.plugin.serverless': 'Serverless',
  'component.plugin.observability': 'Observabilidade',
  'component.plugin.other': 'Outro',
  'component.plugin.all': 'Todos',
  // cors
  'component.pluginForm.cors.allow_origins.tooltip':
    'Quais origens têm permissão para ativar o CORS, formate como: esquema://host:porta, por exemplo: https://somehost.com:8081. Origem múltipla use , para dividir. Quando allow_credential for false, você pode usar * para indicar permitir qualquer origem. você também pode permitir todas as origens forçadamente usando ** mesmo já habilitando allow_credential, mas isso trará alguns riscos de segurança.',
  'component.pluginForm.cors.allow_origins.extra': 'Por exemplo: https://somehost.com:8081',
  'component.pluginForm.cors.allow_methods.tooltip':
    'Qual método é permitido para habilitar o CORS, como: GET, POST etc. Uso de vários métodos, para dividir. Quando allow_credential for false, você pode usar * para indicar permitir todos os métodos. Você também pode permitir qualquer método forçadamente usando ** mesmo já habilitando allow_credential, mas trará alguns riscos de segurança.',
  'component.pluginForm.cors.allow_headers.tooltip':
    'Quais cabeçalhos podem ser definidos na solicitação ao acessar o recurso de origem cruzada. Valor múltiplo use , para dividir. Quando allow_credential for false, você pode usar * para indicar permitir todos os cabeçalhos de solicitação. Você também pode permitir qualquer cabeçalho de forma forçada usando ** mesmo já habilitando allow_credential, mas trará alguns riscos de segurança.',
  'component.pluginForm.cors.expose_headers.tooltip':
    'Quais cabeçalhos podem ser definidos em resposta ao acessar o recurso de origem cruzada. Valor múltiplo use , para dividir. Quando allow_credential for false, você pode usar * para indicar permitir qualquer cabeçalho. Você também pode permitir qualquer cabeçalho de forma forçada usando ** mesmo já habilitando allow_credential, mas trará alguns riscos de segurança.',
  'component.pluginForm.cors.max_age.tooltip':
    'Número máximo de segundos em que os resultados podem ser armazenados em cache. Dentro desse intervalo de tempo, o navegador reutilizará o resultado da última verificação. -1 significa sem cache. Observe que o valor máximo depende do navegador, consulte o MDN para obter detalhes.',
  'component.pluginForm.cors.allow_credential.tooltip':
    "Se você definir esta opção como true, não poderá usar '*' para outras opções.",
  'component.pluginForm.cors.allow_origins_by_metadata.tooltip':
    'Corresponda qual origem tem permissão para ativar o CORS fazendo referência a allow_origins definido nos metadados do plug-in.',
  'component.pluginForm.cors.allow_origins_by_regex.tooltip':
    'Use expressões regex para corresponder a qual origem tem permissão para habilitar o CORS. Cada caixa de entrada só pode ser configurada com uma única expressão regular independente, como ".*.test.com", que pode corresponder a qualquer subdomínio de test.com.',

  // referer-restriction
  'component.pluginForm.referer-restriction.whitelist.tooltip':
    'Lista de nomes de host para a lista de permissões. O nome do host pode ser iniciado com * como curinga.',
  'component.pluginForm.referer-restriction.blacklist.tooltip':
    'Lista de nomes de host para a lista negra. O nome do host pode ser iniciado com * como curinga.',
  'component.pluginForm.referer-restriction.listEmpty.tooltip': 'Lista vazia',
  'component.pluginForm.referer-restriction.bypass_missing.tooltip':
    'Se deve ignorar a verificação quando o cabeçalho Referer estiver ausente ou malformado.',
  'component.pluginForm.referer-restriction.message.tooltip':
    'Mensagem retornada caso o acesso não seja permitido.',

  // api-breaker
  'component.pluginForm.api-breaker.break_response_code.tooltip':
    'Retorne o código de erro quando não estiver saudável.',
  'component.pluginForm.api-breaker.break_response_body.tooltip':
    'Corpo de retorno da mensagem de resposta quando o upstream não está íntegro.',
  'component.pluginForm.api-breaker.break_response_headers.tooltip':
    'Retornar cabeçalhos quando não estiverem íntegros.',
  'component.pluginForm.api-breaker.max_breaker_sec.tooltip': 'Tempo máximo do breaker (segundos).',
  'component.pluginForm.api-breaker.unhealthy.http_statuses.tooltip':
    'Códigos de status quando não saudáveis.',
  'component.pluginForm.api-breaker.unhealthy.failures.tooltip':
    'Número de solicitações de erro consecutivas que acionaram um estado não íntegro.',
  'component.pluginForm.api-breaker.healthy.http_statuses.tooltip':
    'Códigos de status quando saudáveis.',
  'component.pluginForm.api-breaker.healthy.successes.tooltip':
    'Número de solicitações normais consecutivas que acionam o status de integridade.',

  // proxy-mirror
  'component.pluginForm.proxy-mirror.host.tooltip':
    'Especifique um endereço de serviço espelho, por exemplo http://127.0.0.1:9797 (o endereço precisa conter o esquema: http ou https, não a parte URI)',
  'component.pluginForm.proxy-mirror.host.extra': 'por exemplo http://127.0.0.1:9797',
  'component.pluginForm.proxy-mirror.host.ruletip':
    'endereço precisa conter esquema: http ou https, não parte URI',
  'component.pluginForm.proxy-mirror.path.tooltip':
    'Especifique a parte do caminho da solicitação de espelhamento. Sem ele, o caminho atual será usado.',
  'component.pluginForm.proxy-mirror.path.ruletip':
    'Por favor, insira o caminho correto, por exemplo /path',
  'component.pluginForm.proxy-mirror.sample_ratio.tooltip':
    'A proporção de amostra que as solicitações serão espelhadas.',

  // limit-conn
  'component.pluginForm.limit-conn.conn.tooltip':
    'o número máximo de solicitações simultâneas permitidas. As solicitações que excedem essa proporção (e abaixo de conn + burst) serão atrasadas (os segundos de latência são configurados por default_conn_delay) para atender a esse limite.',
  'component.pluginForm.limit-conn.burst.tooltip':
    'o número excessivo de solicitações (ou conexões) simultâneas que podem ser atrasadas.',
  'component.pluginForm.limit-conn.default_conn_delay.tooltip':
    'os segundos de latência da solicitação quando solicitações simultâneas excedem conn, mas abaixo (conn + burst).',
  'component.pluginForm.limit-conn.key_type.tooltip':
    'O tipo de chave, suporte: "var" (var único) e "var_combination" (combinar var)',
  'component.pluginForm.limit-conn.key.tooltip':
    'para limitar o nível de simultaneidade. Por exemplo, pode-se usar o nome do host (ou zona do servidor) como a chave para limitar a simultaneidade por nome do host. Caso contrário, também podemos usar o endereço do cliente como a chave para evitar que um único cliente inunde nosso serviço com muitas conexões ou solicitações paralelas.',
  'component.pluginForm.limit-conn.rejected_code.tooltip':
    'retornado quando a solicitação exceder conn + burst será rejeitado.',
  'component.pluginForm.limit-conn.rejected_msg.tooltip':
    'o corpo da resposta retornado quando a solicitação exceder conn + burst será rejeitado.',
  'component.pluginForm.limit-conn.only_use_default_delay.tooltip':
    'habilite o modo estrito dos segundos de latência. Se você definir esta opção como verdadeira, ela será executada estritamente de acordo com os segundos de latência definidos sem lógica de cálculo adicional.',
  'component.pluginForm.limit-conn.allow_degradation.tooltip':
    'Se deve habilitar a degradação do plug-in quando a função limit-conn estiver temporariamente indisponível. Permita que as solicitações continuem quando o valor for definido como verdadeiro, o padrão é falso.',

  // limit-req
  'component.pluginForm.limit-req.rate.tooltip':
    'O limite da taxa de solicitação especificada (número por segundo). As solicitações que excederem essa taxa (e abaixo do estouro) serão atrasadas para se adequar à taxa.',
  'component.pluginForm.limit-req.burst.tooltip':
    'O número de solicitações excessivas por segundo que podem ser atrasadas. Solicitações que excedam esse limite rígido serão rejeitadas imediatamente.',
  'component.pluginForm.limit-req.key_type.tooltip':
    'O tipo de chave, suporte: "var" (var único) e "var_combination" (combinar var)',
  'component.pluginForm.limit-req.key.tooltip':
    'A chave especificada pelo usuário para limitar a taxa.',
  'component.pluginForm.limit-req.rejected_code.tooltip':
    'O código de status HTTP retornado quando a solicitação excede o limite é rejeitado.',
  'component.pluginForm.limit-req.rejected_msg.tooltip':
    'O corpo da resposta retornado quando a solicitação excede o limite é rejeitado.',
  'component.pluginForm.limit-req.nodelay.tooltip':
    'Se o sinalizador nodelay for verdadeiro, as solicitações em rajada não serão atrasadas',

  'component.plugin.form': 'Forma',
  'component.plugin.format-codes.disable': 'Formatar dados JSON ou YAML',
  'component.plugin.editor': 'Editor de plug-ins',
  'component.plugin.noConfigurationRequired': 'Não precisa de configuração',

  // limit-count
  'component.pluginForm.limit-count.count.tooltip':
    'O número especificado de limite de solicitações.',
  'component.pluginForm.limit-count.time_window.tooltip':
    'A janela de tempo em segundos antes da contagem de solicitações ser redefinida.',
  'component.pluginForm.limit-count.key_type.tooltip':
    'O tipo de chave, suporte: "var" (var único) e "var_combination" (combinar var)',
  'component.pluginForm.limit-count.key.tooltip':
    'A chave especificada pelo usuário para limitar a contagem.',
  'component.pluginForm.limit-count.rejected_code.tooltip':
    'O código de status HTTP retornado quando a solicitação excede o limite é rejeitado, padrão 503.',
  'component.pluginForm.limit-count.rejected_msg.tooltip':
    'O corpo da resposta retornado quando a solicitação excede o limite é rejeitado.',
  'component.pluginForm.limit-count.policy.tooltip':
    'As políticas de limitação de taxa a serem usadas para recuperar e incrementar os limites. Os valores disponíveis são locais (os contadores serão armazenados localmente na memória do nó) e redis (os contadores são armazenados em um servidor Redis e serão compartilhados entre os nós, geralmente use-o para fazer o limite de velocidade global) e redis-cluster (a mesma função do redis, use apenas o padrão de cluster Redis).',
  'component.pluginForm.limit-count.allow_degradation.tooltip':
    'Se deve habilitar a degradação do plug-in quando a função de contagem de limite estiver temporariamente indisponível (por exemplo, tempo limite do redis). Permitir que as solicitações continuem quando o valor for definido como verdadeiro',
  'component.pluginForm.limit-count.show_limit_quota_header.tooltip':
    'Se mostra X-RateLimit-Limit e X-RateLimit-Remaining (que significa o número total de solicitações e o número restante de solicitações que podem ser enviadas) no cabeçalho de resposta',
  'component.pluginForm.limit-count.group.tooltip':
    'A rota configurada com o mesmo grupo compartilhará o mesmo contador',
  'component.pluginForm.limit-count.redis_host.tooltip':
    'Ao usar a política redis, essa propriedade especifica o endereço do servidor Redis.',
  'component.pluginForm.limit-count.redis_port.tooltip':
    'Ao usar a política redis, essa propriedade especifica a porta do servidor Redis.',
  'component.pluginForm.limit-count.redis_password.tooltip':
    'Ao usar a política redis, essa propriedade especifica a senha do servidor Redis.',
  'component.pluginForm.limit-count.redis_database.tooltip':
    'Ao usar a política redis, esta propriedade especifica o banco de dados selecionado do servidor Redis e apenas para o modo de cluster não Redis (modo de instância única ou serviço de nuvem pública Redis que fornece entrada única).',
  'component.pluginForm.limit-count.redis_timeout.tooltip':
    'Ao usar a política redis, essa propriedade especifica o tempo limite em milissegundos de qualquer comando enviado ao servidor Redis.',
  'component.pluginForm.limit-count.redis_cluster_nodes.tooltip':
    'Ao usar a política redis-cluster, essa propriedade é uma lista de endereços de nós de serviço de cluster Redis (pelo menos dois nós).',
  'component.pluginForm.limit-count.redis_cluster_name.tooltip':
    'Ao usar a política redis-cluster, essa propriedade é o nome dos nós de serviço do cluster Redis.',
  'component.pluginForm.limit-count.atLeast2Characters.rule':
    'Por favor insira pelo menos 2 caracteres',
};
