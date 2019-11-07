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
  <div class="plugin-dialog">
    <el-dialog
      :title="'Plugin ' + name + ' Edit'"
      :visible.sync="showDialog"
    >
      <el-form
        v-if="schema.oneOf"
        ref="form"
        :model="data"
        :rules="rules"
        :show-message="false"
        class="oneof-plugin-wrapper"
      >
        <el-form-item
          label="Option"
          :rules="{
            required: true, trigger: 'blur'
          }"
        >
          <el-radio-group
            v-model="data['radioKey']"
            @change="handleOneOfChange"
          >
            <el-radio
              v-for="(value, key) in schema.properties"
              :key="key"
              :label="key"
            >
              {{ key }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-for="(value, index) in data.values"
          :key="index"
          :label="'Value' + (index + 1)"
          :rules="{
            required: true, trigger: 'blur'
          }"
        >
          <el-input v-model="data['values'][index]" />
          <el-button
            v-if="data.values.length !== 1"
            class="remove-value-btn"
            type="danger"
            @click.prevent="removeOneOfPropValue(index)"
          >
            Remove
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-button
            :disabled="oneOfPropHasEmptyValue"
            @click="addValueInput"
          >
            {{ $t('button.addValue') }}
          </el-button>
        </el-form-item>
      </el-form>

      <el-form
        v-if="!schema.oneOf"
        ref="form"
        :model="data"
        :rules="rules"
        :show-message="false"
      >
        <el-form-item
          v-for="(index, key) in schema.properties"
          :key="key"
          :label="key"
          label-width="160px"
          :prop="key"
        >
          <!-- 分情况讨论 -->
          <el-input-number
            v-if="schema.properties[key].type === 'integer' || schema.properties[key].type === 'number'"
            v-model="data[key]"
            :min="schema.properties[key].minimum || -99999999999"
            :max="schema.properties[key].maximum || 99999999999"
            label="描述文字"
            @change="onPropertyChange(key, $event)"
          />

          <el-select
            v-if="schema.properties[key].hasOwnProperty('enum')"
            v-model="data[key]"
            :clearable="true"
            :placeholder="&quot;Select a &quot; + key"
            @change="onPropertyChange(key, $event)"
          >
            <el-option
              v-for="value in schema.properties[key]['enum']"
              :key="value"
              :label="value"
              :value="value"
            />
          </el-select>

          <el-input
            v-if="schema.properties[key].type === 'string' && !schema.properties[key].hasOwnProperty('enum')"
            v-model="data[key]"
            :placeholder="key"
            @input="onPropertyChange(key, $event)"
          />

          <el-switch
            v-if="schema.properties[key].type === 'boolean' && !schema.properties[key].hasOwnProperty('enum')"
            v-model="data[key]"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />

        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          @click="onCancel"
        >
          Cancel
        </el-button>
        <el-button
          type="primary"
          :disabled="!isDataChanged && oneOfPropHasEmptyValue"
          @click="onSave"
        >
          Confirm
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import { getPluginSchema } from '../../api/schema/schema'

const uuidv1 = require('uuid/v1')

@Component({
  name: 'PluginDialog'
})
export default class extends Vue {
  @Prop({ default: false }) private show!: boolean
  @Prop({ default: '' }) private name!: string
  @Prop({ default: null }) private pluginData!: any

  private schema: any = {
    properties: {}
  }
  private rules: any = {}
  private data: any = {}
  private isDataChanged: boolean = false
  private showDialog: boolean = false

  @Watch('show')
  private onShowChange(value: boolean) {
    this.resetPlugin()
    if (value) {
      this.getschema(this.name)
    }
    this.showDialog = value
  }

  private resetPlugin() {
    this.schema = {
      properties: {}
    }
    this.rules = {}
    this.data = {}
    this.isDataChanged = false
  }

  private async getschema(name: string) {
    const schema = await getPluginSchema(name) as any

    if (!schema.properties) {
      this.isDataChanged = true
      return
    }

    this.schema = Object.assign({}, {
      ...schema,
      name: this.name
    })

    const rules = Object.assign({}, schema.properties)

    for (let pluginName in rules) {
      const plugin = Object.assign({}, rules[pluginName])

      rules[pluginName] = {
        trigger: 'blur'
      }

      if (schema.required) {
        rules[pluginName].required = schema.required.includes(pluginName)
      }

      if (plugin.hasOwnProperty('type')) {
        rules[pluginName]['type'] = plugin['type']
      }

      if (plugin.hasOwnProperty('minimum')) {
        rules[pluginName]['min'] = plugin['minimum']
      }

      if (plugin.hasOwnProperty('maximum')) {
        rules[pluginName]['max'] = plugin['maximum']
      }

      if (plugin.hasOwnProperty('enum')) {
        rules[pluginName]['type'] = 'enum'
        rules[pluginName]['enum'] = plugin['enum']
      }
    }

    this.rules = rules

    if (this.pluginData) {
      this.data = Object.assign({}, this.pluginData)
    }

    if (this.name === 'key-auth' && !this.pluginData) {
      this.data = {
        key: uuidv1()
      }

      this.isDataChanged = true
    }

    // Edit lugin data
    if (this.name === 'ip-restriction') {
      const key = Object.keys(this.pluginData)[0]
      this.$nextTick(() => {
        this.data = {
          radioKey: key,
          values: this.pluginData[key]
        }
      })
    }

    // Create new plugin data
    if (this.schema.oneOf) {
      this.data = {
        radioKey: Object.keys(this.schema.properties)[0],
        values: ['']
      }
    }
  }

  private onCancel() {
    this.$emit('hidePlugin')
  }

  private onSave() {
    (this.$refs.form as any).validate((valid: boolean) => {
      // 标记该插件数据是否通过校验
      if (valid) {
        this.data = this.processOneOfProp(this.data)
        this.$emit('save', this.name, this.data)
        this.$message.warning('Your data will be saved after you click the Save button')
      } else {
        return false
      }
    })
  }

  private onPropertyChange(key: any, value: any) {
    this.data[key] = value
    this.isDataChanged = true
  }

  private handleOneOfChange(e: any) {
    this.data.values = ['']
  }

  get oneOfPropHasEmptyValue() {
    return this.data.values ? this.data.values.find((value: string) => value === '') : true
  }

  private addValueInput() {
    this.data.values = this.data.values.concat([''])
  }

  private removeOneOfPropValue(index: number) {
    this.data.values = this.data.values.filter((item: any, _index: number) => index !== _index)
  }

  private processOneOfProp(data: any) {
    if (!this.schema.oneOf) {
      return data
    }

    return {
      [this.data.radioKey]: this.data.values
    }
  }
}
</script>

<style lang="scss">
.plugin-dialog {
  .el-form {
    .el-form-item {
      .el-form-item__content {
        .el-input {
          width: 200px !important;
        }
      }
    }
  }

  .oneof-plugin-wrapper {
    .remove-value-btn {
      margin-left: 10px;
    }
  }
}
</style>
