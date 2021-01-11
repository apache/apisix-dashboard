--
-- Licensed to the Apache Software Foundation (ASF) under one or more
-- contributor license agreements.  See the NOTICE file distributed with
-- this work for additional information regarding copyright ownership.
-- The ASF licenses this file to You under the Apache License, Version 2.0
-- (the "License"); you may not use this file except in compliance with
-- the License.  You may obtain a copy of the License at
--
--     http://www.apache.org/licenses/LICENSE-2.0
--
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS,
-- WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
-- See the License for the specific language governing permissions and
-- limitations under the License.
--
local json = require("json")

-- simulate loading modules to avoid errors that will cause fail to read json schema
local fake_module_list = {
    'cjson',
    'cjson.safe',
    'bit',
    'lfs',
    'ngx.worker',
    'ngx.errlog',
    'ngx.process',
    'ngx.re',
    'ngx.ssl',
    'net.url',
    'opentracing.tracer',
    'pb',
    'prometheus',
    'protoc',
    'skywalking.tracer',

    'resty.cookie',
    'resty.core.regex',
    'resty.core.base',
    'resty.hmac',
    'resty.http',
    'resty.ipmatcher',
    'resty.jit-uuid',
    'resty.jwt',
    'resty.kafka.producer',
    'resty.limit.count',
    'resty.limit.conn',
    'resty.limit.req',
    'resty.logger.socket',
    'resty.lock',
    'resty.openidc',
    'resty.random',
    'resty.redis',
    'resty.rediscluster',
    'resty.signal',
    'resty.string',
    'resty.aes',
    'resty.radixtree',
    'resty.expr.v1',

    'apisix.consumer',
    'apisix.core.json',
    'apisix.core.schema',
    'apisix.upstream',
    'apisix.utils.log-util',
    'apisix.utils.batch-processor',
    'apisix.plugin',
    'apisix.plugins.skywalking.client',
    'apisix.plugins.skywalking.tracer',
    'apisix.plugins.zipkin.codec',
    'apisix.plugins.zipkin.random_sampler',
    'apisix.plugins.zipkin.reporter',
    'apisix.timers'
}
for _, name in ipairs(fake_module_list) do
    package.loaded[name] = {}
end


local empty_function = function()
end


ngx = {}
ngx.re = {}
ngx.timer = {}
ngx.location = {}
ngx.socket = {}
ngx.thread = {}
ngx.worker = {}
ngx.re.gmatch = empty_function
ngx.req = {}
ngx.config = {}
ngx.shared = {
    ["plugin-api-breaker"] = {}
}
ngx.shared.internal_status = {}

-- additional define for management
local time_def = {
   type = "integer",
}
local schema = require("apisix.schema_def")
for _, resource in ipairs({"ssl", "route", "service", "upstream", "consumer"}) do
  schema[resource].properties.create_time = time_def
  schema[resource].properties.update_time = time_def
end
schema.ssl.properties.validity_start = time_def
schema.ssl.properties.validity_end = time_def

package.loaded["apisix.core"] = {
    lrucache = {
        new = empty_function
    },
    schema = schema,
    id = {
        get = empty_function
    },
    table = {
        insert = empty_function
    },
    string = {},
    version = {
        VERSION = ""
    }
}


function get_plugin_list()
    local all = io.popen("ls apisix/plugins");
    local list = {};
    for filename in all:lines() do
        suffix = string.sub(filename, -4)
        if suffix == ".lua" then
            table.insert(list, string.sub(filename, 1, -5))
        end
    end
    all:close()
    return list
end


local schema_all = {}
schema_all.main = schema
schema_all.plugins = {}

local plugins = get_plugin_list()
for idx, plugin_name in pairs(plugins) do
    local plugin = require("apisix.plugins." .. plugin_name)
    if plugin and type(plugin) == "table" and plugin.schema then
        schema_all.plugins[plugin_name]= {
            ['schema'] = plugin.schema
        }
    end
    if plugin and type(plugin) == "table" and plugin.consumer_schema then
        schema_all.plugins[plugin_name]['consumer_schema'] = plugin.consumer_schema
    end
end

print(json.encode(schema_all))
