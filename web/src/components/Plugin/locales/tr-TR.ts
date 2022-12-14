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
    'NOT:Eklentilerinizi değiştirdikten sonra değişiklileri schema.json dosyasına uygulamalısınız.',
  'component.plugin.tip2': 'Nasıl güncellenir?',
  'component.select.pluginTemplate': 'Eklenti şablonlarını seçin',
  'component.step.select.pluginTemplate.select.option': 'Özel',
  'component.plugin.pluginTemplate.tip1':
    '1. Bir routeda halihazırda yapılandırılmış eklentiler alanı varsa, eklenti şablonundaki eklentiler onunla birleştirilir..',
  'component.plugin.pluginTemplate.tip2':
    '2.Eklenti şablonundaki aynı eklenti, eklentilerdeki bir eklentiyi geçersiz kılar.',
  'component.plugin.enable': 'Etkinleştir',
  'component.plugin.disable': 'Devre dışı bırak',
  'component.plugin.authentication': 'Kimlik doğrulama',
  'component.plugin.security': 'Güvenlik',
  'component.plugin.traffic': 'Trafik',
  'component.plugin.serverless': 'Sunucusuz Mimari',
  'component.plugin.observability': 'Gözlemlenebilirlik',
  'component.plugin.other': 'Diğer',
  'component.plugin.all': 'Tümü',
  // cors
  'component.pluginForm.cors.allow_origins.tooltip':
    'Originler CORSları aktif ettiğinde örn : ：scheme://host:port, örn https://somehost.com:8081.Kullanılacak birden çok kaynak allow_credential false olduğunda, herhangi bir kaynağa izin verildiğini belirtmek için * işaretini kullanabilirsiniz. Ayrıca, ** kullanarak tüm kökenlere izin verebilirsiniz, allow_credentialı etkinleştirirseniz bazı güvenlik riskleri getirecektir.',
  'component.pluginForm.cors.allow_methods.tooltip':
    'Methodlar CORSları aktif ettiğinde, örn GET, POST vb. Ayırmak için çoklu method kullanılır. Allow_credential false duruma geldiğinde, Tüm yöntemlere izin ver belirtmek için * kullanabilirsiniz.Ayrıca, allow_credentialı zaten etkinleştirmiş olsanız bile, ** kullanarak herhangi bir yönteme zorla izin verebilirsiniz, ancak bu, bazı güvenlik riskleri getirecektir.',
  'component.pluginForm.cors.allow_headers.tooltip':
    'Kaynaklar arası kaynağa erişirken istekte hangi başlıkların ayarlanmasına izin verilir. Bölmek için çoklu değer kullanımı. allow_credential false olduğunda, tüm istek üstbilgilerine izin ver belirtmek için * kullanabilirsiniz. Ayrıca, ** kullanarak herhangi bir üstbilgiye zorla izin verebilirsiniz, hatta allow_credentialı hali hazırda etkinleştirdiyseniz bu bazı güvenlik riskleri getirecektir,',
  'component.pluginForm.cors.expose_headers.tooltip':
    'Başlangıçlar arası kaynağa erişildiğinde yanıt olarak hangi başlıkların ayarlanmasına izin verilir. Bölmek için çoklu değer kullanımı. allow_credential false olduğunda, herhangi bir başlığa izin ver belirtmek için * kullanabilirsiniz. Ayrıca, ** kullanarak herhangi bir üstbilgiye zorla izin verebilirsiniz, hatta allow_credentialı zaten etkinleştirin, ancak bu bazı güvenlik riskleri getirecektir.',
  'component.pluginForm.cors.max_age.tooltip':
    'Sonuçların önbelleğe alınabileceği maksimum saniye sayısı. Bu zaman aralığında tarayıcı son kontrol sonucunu yeniden kullanır. -1 önbellek yok demektir. Lütfen maksimum değerin tarayıcıya bağlı olduğunu unutmayın, ayrıntılar için lütfen MDNye bakınız.',
  'component.pluginForm.cors.allow_credential.tooltip':
    "Bu seçeneği true olarak ayarlarsanız, diğer seçenekler için '*' ı kullanamazsınız.",
  'component.pluginForm.cors.allow_origins_by_metadata.tooltip':
    'Eklenti meta verilerindeki allow_origins kümesine başvurarak CORSu etkinleştirmek için hangi Origine izin verildiğini eşleştirin.',
  'component.pluginForm.cors.allow_origins_by_regex.tooltip':
    'CORSu etkinleştirmek için izin verilen kaynakları eşleştirmek için regex ifadelerini kullanın. Her giriş kutusu yalnızca bir bağımsız normal ifade ile yapılandırılabilir, örneğin ".*.test.com" gibi, test.com\'un her alt etki alanını eşleştirebilir.',
  // referer-restriction
  'component.pluginForm.referer-restriction.whitelist.tooltip':
    'Whiteliste alınacak ana bilgisayar adı listesi. Ana bilgisayar adı, joker karakter olarak * ile başlatılabilir.',
  'component.pluginForm.referer-restriction.blacklist.tooltip':
    'Kara listeye alınacak ana bilgisayar adı listesi. Ana bilgisayar adı, joker karakter olarak * ile başlatılabilir.',
  'component.pluginForm.referer-restriction.listEmpty.tooltip': 'Boş Liste',
  'component.pluginForm.referer-restriction.bypass_missing.tooltip':
    'Yönlendiren başlığı eksik veya hatalı biçimlendirilmiş olduğunda kontrolün atlanıp atlanmayacağı.',
  'component.pluginForm.referer-restriction.message.tooltip':
    'Erişime izin verilmemesi durumunda mesaj döndürülür',
  // api-breaker
  'component.pluginForm.api-breaker.break_response_code.tooltip':
    'Unhealthy durum oluştuğunda hata kodunu döndür.',
  'component.pluginForm.api-breaker.break_response_body.tooltip':
    'Sağlıksız bir durum oluştuğunda telegramları döndürür.',
  'component.pluginForm.api-breaker.break_response_headers.tooltip':
    'Sağlıksız olduğunda başlıkları döndürün.',
  'component.pluginForm.api-breaker.max_breaker_sec.tooltip': 'Kesme Zamanı(Saniye)',
  'component.pluginForm.api-breaker.unhealthy.http_statuses.tooltip':
    'Durum Kodları (Unhealthy durumda).',
  'component.pluginForm.api-breaker.unhealthy.failures.tooltip':
    'Unhealthy bir durumu tetikleyen ardışık hata isteklerinin sayısı.',
  'component.pluginForm.api-breaker.healthy.http_statuses.tooltip':
    'Durum Kodları (Unhealthy durumda)',
  'component.pluginForm.api-breaker.healthy.successes.tooltip':
    'Healthy durumu tetikleyen ardışık normal isteklerin sayısı.',
  // proxy-mirror
  'component.pluginForm.proxy-mirror.host.tooltip':
    'Bir mirror servis adresi belirtin, ör. http://127.0.0.1:9797 (adresin şema içermesi gerekir: URI kısmı değil, http veya https)',
  'component.pluginForm.proxy-mirror.host.extra': 'örn. http://127.0.0.1:9797',
  'component.pluginForm.proxy-mirror.host.ruletip':
    'Adres şema içermelidir http veya https,  URI parçası olmamalı',
  'component.pluginForm.proxy-mirror.path.tooltip':
    'Yansıtma isteğinin yol bölümünü belirtin. O olmazsa mevcut yol kullanılacaktır.',
  'component.pluginForm.proxy-mirror.path.ruletip': 'Lütfen doğru yolu girin, ör. /path',
  'component.pluginForm.proxy-mirror.sample_ratio.tooltip':
    'isteklerin mirror edileceği örnek oranı.',
  // limit-conn
  'component.pluginForm.limit-conn.conn.tooltip':
    'izin verilen maksimum eşzamanlı istek sayısı. Bu oranı aşan (ve bağlantı + çoğuşmanın altındaki) istekler bu eşiğe uyacak şekilde ertelenir (gecikme saniyeleri default_conn_delay tarafından yapılandırılır).',
  'component.pluginForm.limit-conn.burst.tooltip':
    'Gecikmesine izin verilen aşırı eşzamanlı isteklerin (veya bağlantıların) sayısı.',
  'component.pluginForm.limit-conn.default_conn_delay.tooltip':
    'eşzamanlı istekler bağlantıyı aştığında ancak altında (conn + burst) olduğunda isteğin gecikme saniyeleri.',
  'component.pluginForm.limit-conn.key_type.tooltip':
    'Anahtar tipinin destekledikleri; "var" (single var) ve "var_combination" (combine var)',
  'component.pluginForm.limit-conn.key.tooltip':
    'Eşzamanlılık seviyesini sınırlamak için kullanılır. Örneğin ana bilgisayar adı başına eşzamanlılığı sınırlamamız için ana bilgisayar adı (veya sunucu bölgesi) anahtar olarak kullanılabilir Aksi takdirde tek bir istemcinin hizmetimizi çok fazla bağlantı veya istekle doldurmasını önlemek için istemci adresini anahtar olarak da kullanabiliriz.',
  'component.pluginForm.limit-conn.rejected_code.tooltip':
    'istek (conn + burst) aştığında döndürülen reddedilecektir.',
  'component.pluginForm.limit-conn.rejected_msg.tooltip':
    'istek (conn + burst) aştığında döndürülen yanıt gövdesi reddedilecektir.',
  'component.pluginForm.limit-conn.only_use_default_delay.tooltip':
    'gecikme saniyelerinin katı modunu etkinleştirin. Bu seçeneği true olarak ayarlarsanız, ek hesaplama mantığı olmadan kesinlikle belirlediğiniz gecikme saniyelerine göre çalışır.',
  'component.pluginForm.limit-conn.allow_degradation.tooltip':
    'Limit-bağlantı işlevi geçici olarak kullanılamadığında eklenti bozulmasını etkinleştirip etkinleştirmeme. Değer true, varsayılan false olarak ayarlandığında isteklerin devam etmesine izin verir.',
  // limit-req
  'component.pluginForm.limit-req.rate.tooltip':
    'Belirtilen istek oranı (saniyedeki sayı) eşiği. Bu oranı aşan (ve patlamanın altındaki) istekler, orana uymak için gecikecektir.',
  'component.pluginForm.limit-req.burst.tooltip':
    'Saniyedeki aşırı istek sayısının ertelenmesine izin verildi. Bu katı sınırı aşan istekler hemen reddedilecektir.',
  'component.pluginForm.limit-req.key_type.tooltip':
    'Anahtar tipinin destekledikleri; "var" (single var) ve "var_combination" (combine var)',
  'component.pluginForm.limit-req.key.tooltip':
    'Hızı sınırlamak için kullanıcı tarafından belirlenen anahtar.',
  'component.pluginForm.limit-req.rejected_code.tooltip':
    'Talep eşiği aştığında döndürülen HTTP durum kodu reddedilir.',
  'component.pluginForm.limit-req.rejected_msg.tooltip':
    'Talep eşiği aştığında döndürülen yanıt body reddedilir.',
  'component.pluginForm.limit-req.nodelay.tooltip':
    'Gecikme bayrağı doğru değilse, engellenen istekler ertelenmez',
  'component.plugin.form': 'Eklenti Formu',
  'component.plugin.format-codes.disable': 'JSON veya YAML formatı',
  'component.plugin.editor': 'Eklenti Düzenleyici',
  'component.plugin.noConfigurationRequired': 'Eklenti için yapılandırma gerekli değil',

  // limit-count
  'component.pluginForm.limit-count.count.tooltip': 'Belirtilen sayıda istek eşiği.',
  'component.pluginForm.limit-count.time_window.tooltip':
    'İstek sayısı sıfırlanmadan önceki saniye cinsinden zaman penceresi.',
  'component.pluginForm.limit-count.key_type.tooltip':
    'Anahtar tipinin destekledikleri; "var" (single var) ve "var_combination" (combine var)',
  'component.pluginForm.limit-count.key.tooltip':
    'Sayıyı sınırlamak için kullanıcı tarafından belirlenen anahtar.',
  'component.pluginForm.limit-count.rejected_code.tooltip':
    'Talep eşiği aştığında döndürülen HTTP durum kodu reddedilir, varsayılan kod 503dür.',
  'component.pluginForm.limit-count.rejected_msg.tooltip':
    'Talep eşiği aştığında döndürülen yanıt gövdesi reddedilir.',
  'component.pluginForm.limit-count.policy.tooltip':
    'Sınırları almak ve artırmak için kullanılacak hız sınırlayıcı politikalar. Kullanılabilir değerler yereldir (sayaçlar düğümdeki bellekte yerel olarak depolanır) ve redis (sayaçlar bir Redis sunucusunda depolanır ve düğümler arasında paylaşılır, genellikle bunu küresel hız sınırını yapmak için kullanır) ve yeniden kümeleme (redis ile aynı işlev, yalnızca Redis küme desenini kullanın).',
  'component.pluginForm.limit-count.allow_degradation.tooltip':
    'Limit-count işlevi geçici olarak kullanılamadığında eklenti bozulmasının etkinleştirilip etkinleştirilmediği (ör. redis zaman aşımı). Değer true olarak ayarlandığında isteklerin devam etmesine izin verir',
  'component.pluginForm.limit-count.show_limit_quota_header.tooltip':
    'Yanıt başlığında X-RateLimit-Limit ve X-RateLimit-Remaining (yani toplam istek sayısı ve gönderilebilecek kalan istek sayısı anlamına gelir)',
  'component.pluginForm.limit-count.group.tooltip':
    'Aynı grupla yapılandırılan rota aynı sayacı paylaşacaktır',
  'component.pluginForm.limit-count.redis_host.tooltip':
    'Redis ilkesini kullanırken, bu özellik Redis sunucusunun adresini belirtir.',
  'component.pluginForm.limit-count.redis_port.tooltip':
    'Redis ilkesini kullanırken, bu özellik Redis sunucusunun bağlantı noktasını belirtir.',
  'component.pluginForm.limit-count.redis_password.tooltip':
    'Redis ilkesini kullanırken, bu özellik Redis sunucusunun parolasını belirtir.',
  'component.pluginForm.limit-count.redis_database.tooltip':
    'Redis ilkesini kullanırken, bu özellik, Redis sunucusundan seçtiğiniz veritabanını ve yalnızca Redis olmayan küme modu (tek örnek modu veya tek giriş sağlayan Redis genel bulut hizmeti) için belirtir.',
  'component.pluginForm.limit-count.redis_timeout.tooltip':
    'Redis ilkesini kullanırken, bu özellik Redis sunucusuna gönderilen herhangi bir komutun zaman aşımını milisaniye cinsinden belirtir.',
  'component.pluginForm.limit-count.redis_cluster_nodes.tooltip':
    'Redis-cluster ilkesi kullanılırken bu özellik, Redis küme hizmeti düğümlerinin (en az iki düğüm) adreslerinin bir listesidir.',
  'component.pluginForm.limit-count.redis_cluster_name.tooltip':
    'Redis-cluster ilkesi kullanılırken, bu özellik Redis küme hizmeti düğümlerinin adıdır.',
  'component.pluginForm.limit-count.atLeast2Characters.rule': 'Please enter at least 2 characters',
};
