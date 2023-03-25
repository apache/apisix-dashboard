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
  'component.upstream.fields.tls.client_key': 'Kullanıcı Anahtarı',
  'component.upstream.fields.tls.client_key.required': 'Kullanıcı Anahtarını girmelisiniz',
  'component.upstream.fields.tls.client_cert': 'Kullanıcı Sertifikası',
  'component.upstream.fields.tls.client_cert.required': 'Kullanıcı Sertifikasını girmelisiniz',

  'component.upstream.fields.upstream_type': 'Upstream Tipi',
  'component.upstream.fields.upstream_type.node': 'Node',
  'component.upstream.fields.upstream_type.service_discovery': 'Servis Keşfi',

  'component.upstream.fields.discovery_type': 'Keşif Tipi',
  'component.upstream.fields.discovery_type.tooltip': 'Keşif Tipi',
  'component.upstream.fields.discovery_type.placeholder': 'Keşif tipini seçiniz',
  'component.upstream.fields.discovery_type.type.dns': 'DNS',
  'component.upstream.fields.discovery_type.type.consul': 'Consul',
  'component.upstream.fields.discovery_type.type.consul_kv': 'Consul KV',
  'component.upstream.fields.discovery_type.type.nacos': 'Nacos',
  'component.upstream.fields.discovery_type.type.eureka': 'Eureka',
  'component.upstream.fields.discovery_type.type.kubernetes': 'Kubernetes',

  'component.upstream.fields.discovery_args.group_name': 'Grup Adı',
  'component.upstream.fields.discovery_args.group_name.tooltip': 'Grup Adı',
  'component.upstream.fields.discovery_args.group_name.placeholder': 'Lütfen grup adını giriniz',
  'component.upstream.fields.discovery_args.namespace_id': 'Alanadı kimliği',
  'component.upstream.fields.discovery_args.namespace_id.tooltip': 'Alanadı kimliği',
  'component.upstream.fields.discovery_args.namespace_id.placeholder':
    'Lütfen alanadı kimliğini giriniz',

  'component.upstream.fields.service_name': 'Servis Adı',
  'component.upstream.fields.service_name.tooltip': 'Servis Adı',
  'component.upstream.fields.service_name.placeholder': 'Lütfen servis adını giriniz',

  'component.upstream.fields.scheme.tooltip.stream':
    'Bu tür yalnızca Akış yönlendirme, yani katman 4 proxy için kullanılır. Referans: https://apisix.apache.org/docs/apisix/stream-proxy/',
  'component.upstream.fields.scheme.tooltip.pubsub':
    'Bu tür yalnızca abonelik senaryolarını yayınlamak için kullanılır. Referans: https://apisix.apache.org/docs/apisix/pubsub/',

  'component.upstream.fields.tls': 'TLS',
  'component.upstream.fields.tls.tooltip': 'TLS Sertifikası',

  'component.upstream.fields.hash_on': 'Hash açık',
  'component.upstream.fields.hash_on.tooltip': 'Hash girişi olarak ne kullanılır?',

  'component.upstream.fields.key': 'Anahtar',
  'component.upstream.fields.key.tooltip': 'Anahtar girdi olarak hashing',

  'component.upstream.fields.retries': 'Deneme',
  'component.upstream.fields.retries.tooltip':
    'Yeniden deneme mekanizması, isteği bir sonraki yukarı akış düğümüne gönderir. 0 değeri, yeniden deneme mekanizmasını devre dışı bırakır ve kullanılabilir arka uç düğümlerinin sayısını kullanmak için tabloyu boş bırakır.',

  'component.upstream.fields.retry_timeout': 'Deneme Zaman Aşımı',
  'component.upstream.fields.retry_timeout.tooltip':
    'Yeniden denemelerin sürdürülebileceği saniye miktarını sınırlamak için bir sayı yapılandırın ve önceki istek ve yeniden deneme istekleri çok uzun sürdüyse yeniden denemelere devam etmeyin. 0, yeniden deneme zaman aşımı mekanizmasını devre dışı bırakmak anlamına gelir.',

  'component.upstream.fields.keepalive_pool': 'Keepalive Poolu',
  'component.upstream.fields.keepalive_pool.tooltip':
    'Upstream için bağımsız bir keepalive poolu ayarla',
  'component.upstream.fields.keepalive_pool.size': 'Ölçü',
  'component.upstream.fields.keepalive_pool.size.placeholder': 'Ölçüyü giriniz',
  'component.upstream.fields.keepalive_pool.idle_timeout': 'Boşta kalma zaman aşımı',
  'component.upstream.fields.keepalive_pool.idle_timeout.placeholder':
    'Boşta kalma zaman aşımını giriniz',
  'component.upstream.fields.keepalive_pool.requests': 'İstekler',
  'component.upstream.fields.keepalive_pool.requests.placeholder': 'İstekleri giriniz',

  'component.upstream.fields.checks.active.type': 'Aktif',
  'component.upstream.fields.checks.active.type.tooltip':
    'HTTP veya HTTPS kullanarak etkin healtcheck denetimleri gerçekleştirmeyi veya yalnızca TCP bağlantısı yapmayı denemeyi deneyin.',

  'component.upstream.fields.checks.active.concurrency': 'Eşzamanlı',
  'component.upstream.fields.checks.active.concurrency.tooltip':
    'Aktif healthcheck kontrollerinde aynı anda kontrol etmek için hedef sayısı.',

  'component.upstream.fields.checks.active.host': 'Host',
  'component.upstream.fields.checks.active.host.required': 'Lütfen host adını giriniz.',
  'component.upstream.fields.checks.active.host.tooltip':
    'Etkin healthcheck kontrolünü gerçekleştirmek için kullanılan HTTP isteğinin ana bilgisayar adı',
  'component.upstream.fields.checks.active.host.scope': 'Only letters, numbers and . are supported',

  'component.upstream.fields.checks.active.port': 'Port',

  'component.upstream.fields.checks.active.http_path': 'HTTP Yolu',
  'component.upstream.fields.checks.active.http_path.tooltip':
    'Hedefe HTTP GET isteği düzenlenirken kullanılması gereken yoldur. Öntanımlı değer /.',
  'component.upstream.fields.checks.active.http_path.placeholder':
    'Lütfen HTTP istek yolunu giriniz. ',

  'component.upstream.fields.checks.active.https_verify_certificate': 'HTTP Sertifikasını doğrula',
  'component.upstream.fields.checks.active.https_verify_certificate.tooltip':
    'Etkin uygulama yaparken uzak ana bilgisayarın SSL sertifikasının geçerliliğini kontrol edip etmeyeceğini belirler.',

  'component.upstream.fields.checks.active.req_headers': 'Request Headerları',
  'component.upstream.fields.checks.active.req_headers.tooltip':
    'Ek request header, örnek: User-Agent: curl/7.29.0',

  'component.upstream.fields.checks.active.healthy.interval': 'Aralıklar',
  'component.upstream.fields.checks.active.healthy.interval.tooltip':
    'Sağlıklı hedefler için kontroller arasındaki aralık (saniye cinsinden) ',

  'component.upstream.fields.checks.active.healthy.successes': 'Başarımlar',
  'component.upstream.fields.checks.active.healthy.successes.tooltip':
    'Bir hedefi sağlıklı olarak değerlendirilecek başarı sayısı  ',
  'component.upstream.fields.checks.active.healthy.successes.required':
    'Lütfen başarı sayısını giriniz.',

  'component.upstream.fields.checks.active.healthy.http_statuses': 'HTTP Durumları',
  'component.upstream.fields.checks.active.healthy.http_statuses.tooltip':
    'Etkin durum denetimlerinde bir araştırma tarafından döndürüldüğünde, sağlıklı olduğunu belirten bir başarı olarak değerlendirilecek bir dizi HTTP durumu.',

  'component.upstream.fields.checks.active.unhealthy.timeouts': 'Zaman Aşımı',
  'component.upstream.fields.checks.active.unhealthy.timeouts.tooltip':
    'Bir hedefi sağlıksız olarak değerlendirmek için etkin araştırmalarda zaman aşımı sayısı.',

  'component.upstream.fields.checks.active.unhealthy.http_failures': 'HTTP Hataları',
  'component.upstream.fields.checks.active.unhealthy.http_failures.tooltip':
    'Bir hedefi sağlıksız olarak değerlendirmek için HTTP hatalarının sayısı',
  'component.upstream.fields.checks.active.unhealthy.http_failures.required':
    'Lütfen HTTP hatalarını girin',

  'component.upstream.fields.checks.active.unhealthy.tcp_failures': 'TCP Hataları',
  'component.upstream.fields.checks.active.unhealthy.tcp_failures.tooltip':
    'Bir hedefi sağlıksız olarak değerlendirmek için TCP hatalarının sayısı',
  'component.upstream.fields.checks.active.unhealthy.tcp_failures.required':
    'Lütfen TCP Hatalarını girin',

  'component.upstream.fields.checks.active.unhealthy.interval': 'Aralıklar',
  'component.upstream.fields.checks.active.unhealthy.interval.tooltip':
    'Sağlıksız hedefler için aktif sağlık kontrolleri arasındaki aralık (saniye cinsinden). Sıfır değeri, sağlıklı hedefler için aktif probların gerçekleştirilmemesi gerektiğini gösterir.',
  'component.upstream.fields.checks.active.unhealthy.required': 'Lütfen sağlıksız aralığı girin ',

  'component.upstream.fields.checks.passive.healthy.successes': 'Başarımlar',
  'component.upstream.fields.checks.passive.healthy.successes.tooltip':
    'Bir hedefi sağlıklı olarak değerlendirilecek başarı sayısı',
  'component.upstream.fields.checks.passive.healthy.successes.required':
    'Lütfen başarı sayısını giriniz.',

  'component.upstream.fields.checks.passive.unhealthy.timeouts': 'Zaman Aşımı',
  'component.upstream.fields.checks.passive.unhealthy.timeouts.tooltip':
    'Pasif sağlık kontrollerinde gözlemlendiği gibi, bir hedefi sağlıksız olarak değerlendirmek için proxy trafiğindeki zaman aşımlarının sayısı.',

  'component.upstream.other.none': 'Yok (Yalnızca hizmeti bağlarken kullanılabilir)',
  'component.upstream.other.pass_host-with-multiple-nodes.title':
    'Lütfen hedef düğüm yapılandırmasını kontrol ediniz',
  'component.upstream.other.pass_host-with-multiple-nodes':
    'Hedef düğüm listesinde bir ana bilgisayar adı veya IP kullanırken yalnızca bir hedef düğüm olduğundan emin olun',
  'component.upstream.other.health-check.passive-only':
    'Pasif sağlık denetimi etkinleştirildiğinde, aynı anda etkin sağlık denetiminin de etkinleştirilmesi gerekir.',
  'component.upstream.other.health-check.invalid':
    'Lütfen sağlık kontrolü yapılandırmasını kontrol edin',
};
