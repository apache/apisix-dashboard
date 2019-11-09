<!--
#
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
-->

<template>
  <div class="container">
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="80px"
      :show-message="false"
    >
      <el-form-item
        label="Desc"
      >
        <el-input
          v-model="form.desc"
          placeholder="Description"
        />
      </el-form-item>

      <el-form-item
        label="URIs"
        prop="uris"
        placeholder="can write multi uri here"
      >
        <el-select
          v-model="form.uris"
          allow-create
          filterable
          multiple
          default-first-option
          @change="filterUriOptions"
        >
          <el-option
            v-for="item in ExistedUris"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        label="Hosts"
        prop="hosts"
        placeholder="Hosts"
      >
        <el-select
          v-model="form.hosts"
          multiple
          filterable
          allow-create
          default-first-option
          @change="filterHostsOptions"
        >
          <el-option
            v-for="item in ExistedHosts"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        label="Remote Address"
        prop="remote_addr"
      >
        <el-input
          v-model="form.remote_addr"
          placeholder="Remote Address"
        />
      </el-form-item>

      <el-form-item
        label="Methods"
      >
        <el-select
          v-model="form.methods"
          multiple
          placeholder="Methods"
        >
          <el-option
            v-for="item in methods"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        label="Upstream"
        prop="upstream_id"
      >
        <el-select
          v-model="form.upstream_id"
          placeholder="Upstream"
          clearable
          filterable
        >
          <el-option
            v-for="item in upstreamList"
            :key="item.id"
            :label="item.desc"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        label="Service"
        prop="service_id"
      >
        <el-select
          v-model="form.service_id"
          placeholder="Service"
          clearable
          filterable
        >
          <el-option
            v-for="item in serviceList"
            :key="item.id"
            :label="item.desc"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        v-for="(index, item) in form.plugins"
        :key="item"
        :label="&quot;plugin&quot;"
        class="plugin-item"
      >
        <el-button
          v-if="item !== 'tempPlugin'"
          type="info"
          plain
          @click="showPlugin(item)"
        >
          {{ item }}
        </el-button>

        <el-button
          v-if="item !== 'tempPlugin'"
          type="danger"
          @click.prevent="removePlugin(item)"
        >
          {{ $t('button.delete') }}
        </el-button>

        <el-select
          v-if="item === 'tempPlugin'"
          :value="null"
          class="plugin-select"
          placeholder="Select a Plugin"
          @change="showPlugin"
        >
          <el-option
            v-for="name in filteredPluginList"
            :key="name"
            :label="name"
            :value="name"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button
          :disabled="!filteredPluginList.length"
          @click="addPlugin"
        >
          {{ $t('button.add_plugin') }}
        </el-button>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          @click="onSubmit"
        >
          {{ $t('button.save') }}
        </el-button>
        <el-button @click="toPreviousPage">
          {{ $t('button.cancel') }}
        </el-button>
      </el-form-item>
    </el-form>
    <PluginDialog
      :show="showPluginDialog"
      :name="pluginName"
      :plugin-data="form.plugins[pluginName]"
      @hidePlugin="showPluginDialog = false"
      @save="onPluginSave"
    />
  </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { Form } from 'element-ui'

import PluginDialog from '@/components/PluginDialog/index.vue'

import { getRouter, createRouter, updateRouter } from '@/api/schema/routes'
import { getPluginList } from '@/api/schema/plugins'
import { getUpstreamList } from '@/api/schema/upstream'
import { getServiceList } from '@/api/schema/services'
import { TagsViewModule } from '@/store/modules/tags-view'

@Component({
  name: 'RouterEdit',
  components: {
    PluginDialog
  }
})

export default class extends Vue {
  private form = {
    uris: [],
    hosts: [],
    remote_addr: '',
    upstream_id: '',
    service_id: '',
    methods: [],
    plugins: {},
    desc: ''
  }

  // TODO: can add existed info from route list
  private ExistedUris = [{ }]
  private ExistedHosts = [{ }]

  private rules = {
    uris: {
      required: true
    }
  }
  private isEditMode: boolean = false

  private methods = [
    'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'
  ]

  private pluginList = []
  private pluginName: string = ''
  private showPluginDialog: boolean = false
  private upstreamList = []
  private serviceList = []

  created() {
    this.isEditMode = (this.$route as any).name.indexOf('Create') === -1

    if (this.isEditMode) {
      this.getData()
    }

    this.getPluginList()
    this.getUpstreamList()
    this.getServiceList()
  }

  get filteredPluginList() {
    return this.pluginList.filter(item => !this.form.plugins.hasOwnProperty(item))
  }

  private reset() {
    this.form = {
      uris: [],
      hosts: [],
      remote_addr: '',
      upstream_id: '',
      service_id: '',
      methods: [],
      plugins: {},
      desc: ''
    }
  }

  filterDataWithRegex(val: any, regex: any) {
    if (val.length > 0) {
      const newArr:string[] = []
      val.filter(function(item: any) {
        if (typeof item === 'string') {
          item = item.replace(/\s+/g, '')
          if (regex.test(item)) {
            newArr.push(item)
          }
        }
      })
      newArr.map(function(item: any, index: number) {
        val[index] = item
      })
      if (val.length > newArr.length) {
        val.splice(newArr.length, val.length)
      }
    }
  }

  private filterUriOptions(val: any) {
    this.filterDataWithRegex(val, new RegExp('^([\\*\\./0-9a-zA-Z-_~@\\?\\!#$\\(\\)]+)$'))
  }

  private filterHostsOptions(val: any) {
    let regexpFilter = new RegExp('^(([0-9a-zA-Z-]+|\\*)\\.)?([0-9a-zA-Z-]+\\.)+([a-zA-Z]{2,12})$')
    this.filterDataWithRegex(val, regexpFilter)
  }

  private async getData() {
    const { id } = this.$route.params
    const {
      node: {
        value: {
          uris = [],
          hosts = [],
          remote_addr = '',
          upstream_id = '',
          service_id = '',
          methods = [],
          plugins = {},
          desc = ''
        }
      }
    } = await getRouter(id) as any

    this.form = {
      uris,
      hosts,
      remote_addr,
      upstream_id,
      service_id,
      methods,
      plugins,
      desc
    }
  }

  private async onSubmit() {
    (this.$refs.form as any).validate(async(valid: boolean) => {
      if (valid) {
        let data = Object.assign({}, this.form)
        if (!data.methods.length) {
          delete data.methods
        }

        Object.entries(data).forEach(([key, value]) => {
          if (typeof data[key] === 'object') {
            if (key !== 'plugins' && Object.keys(value).length === 0) {
              delete data[key]
            }
          } else {
            if (value === '') {
              delete data[key]
            }
          }
        })

        if (this.isEditMode) {
          await updateRouter(this.$route.params.id, data)
        } else {
          await createRouter(data)
        }

        this.$message.success(`${this.isEditMode ? 'Update the' : 'Create a'} service successfully!`)

        if (!this.isEditMode) {
          TagsViewModule.delView(this.$route)
          this.$nextTick(() => {
            this.$router.push({
              name: 'SchemaRoutesList'
            })
          })
        }
      } else {
        return false
      }
    })
  }

  private toPreviousPage() {
    this.$router.go(-1)
  }

  private async getUpstreamList() {
    const {
      node: {
        nodes = []
      }
    } = await getUpstreamList() as any

    this.upstreamList = nodes.map((item: any) => {
      const id = item.key.match(/\/([0-9]+)/)[1]
      return {
        ...item.value,
        id
      }
    })
  }

  private async getServiceList() {
    const {
      node: {
        nodes = []
      }
    } = await getServiceList() as any

    this.serviceList = nodes.map((item: any) => {
      const id = item.key.match(/\/([0-9]+)/)[1]
      return {
        ...item.value,
        id
      }
    })
  }

  private async getPluginList() {
    this.pluginList = await getPluginList() as any
  }

  private async showPlugin(name: string) {
    this.pluginName = name
    this.showPluginDialog = true
  }

  private onPluginSave(name: string, data: any) {
    delete this.form.plugins['tempPlugin']
    this.showPluginDialog = false
    this.form.plugins[name] = data
  }

  private async addPlugin() {
    if (this.form.plugins.hasOwnProperty('tempPlugin')) return

    this.form.plugins = {
      ...this.form.plugins,
      tempPlugin: null
    }
  }

  private removePlugin(name: any) {
    this.$confirm(`Do you want to remove ${name} plugin?`, 'Warning', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })
      .then(async() => {
        Vue.delete(this.form.plugins, name)
      }).catch(() => {})
  }
}
</script>

<style lang='scss'>
.container {
  padding: 20px;
  .el-form {
    .el-form-item {
      .el-form-item__content {
        .el-input {
          width: 220px;
        }
      }
    }
  }
}
</style>
