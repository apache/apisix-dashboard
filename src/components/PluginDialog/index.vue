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
          <!-- number property -->
          <el-input-number
            v-if="schema.properties[key].type === 'integer' || schema.properties[key].type === 'number'"
            v-model="data[key]"
            :min="schema.properties[key].minimum || -99999999999"
            :max="schema.properties[key].maximum || 99999999999"
            label="描述文字"
            @change="onPropertyChange(key, $event)"
          />

          <!-- enum property -->
          <el-select
            v-if="schema.properties[key].hasOwnProperty('enum')"
            v-model="data[key]"
            :clearable="true"
            :placeholder="`Select a ${key}`"
            @change="onPropertyChange(key, $event)"
          >
            <el-option
              v-for="value in schema.properties[key]['enum']"
              :key="value"
              :label="value"
              :value="value"
            />
          </el-select>

          <!-- string property -->
          <el-input
            v-if="schema.properties[key].type === 'string' && !schema.properties[key].hasOwnProperty('enum')"
            v-model="data[key]"
            :placeholder="key"
            @input="onPropertyChange(key, $event)"
          />

          <!-- boolean property -->
          <el-switch
            v-if="schema.properties[key].type === 'boolean' && !schema.properties[key].hasOwnProperty('enum')"
            v-model="data[key]"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />

          <!-- array property -->
          <div
            v-if="schema.properties[key].type === 'array'"
            class="array-input-container"
          >
            <el-input
              v-for="(arrayIndex) in arrayPropertiesLength[key]"
              :key="arrayIndex"
              v-model="data[key][arrayIndex]"
              :placeholder="`${key} [${arrayIndex}]`"
              @input="isDataChanged = true"
            />

            <el-button
              @click="addArrayItem(key)"
            >
              {{ $t('button.addValue') }}
            </el-button>
          </div>

          <!-- object property -->
          <div
            v-if="schema.properties[key].type === 'object'"
            class="object-input-container"
          >
            <div
              v-for="(objectItem, objectIndex) in objectPropertiesArray[key]"
              :key="objectIndex"
              class="object-input-item"
            >
              <el-input
                v-model="objectPropertiesArray[key][objectIndex].key"
                :placeholder="`${key} [key ${objectIndex}]`"
                @input="onObjectPropertyChange(key, $event, true)"
              />
              <el-input
                v-model="objectPropertiesArray[key][objectIndex].value"
                :placeholder="`${key} [value ${objectIndex}]`"
                @input="onObjectPropertyChange(key, $event, false)"
              />
              <el-button
                @click="deleteObjectItem(key, objectIndex)"
              >
                {{ $t('button.delete') }}
              </el-button>
            </div>
            <el-button
              @click="addObjectItem(key)"
            >
              {{ $t('button.addValue') }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          @click="onCancel"
        >
          {{ $t('button.cancel') }}
        </el-button>
        <el-button
          type="primary"
          :disabled="!isDataChanged && oneOfPropHasEmptyValue"
          @click="onSave"
        >
          {{ $t('button.confirm') }}
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
  private arrayPropertiesLength = {}
  private objectPropertiesArray = {}

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

    // Generate initial data and merge current data
    let schemaKeys = {}
    for (let key in schema.properties) {
      if (schema.properties[key].default) {
        schemaKeys[key] = schema.properties[key].default
        continue
      }

      switch (schema.properties[key].type) {
        case 'array':
          schemaKeys[key] = []
          this.arrayPropertiesLength[key] = [...new Array(this.pluginData[key] ? this.pluginData[key].length : schema.properties[key].minItems).keys()]
          break
        case 'object':
          schemaKeys[key] = {}
          this.objectPropertiesArray[key] = []
          if (this.pluginData[key]) {
            Object.keys(this.pluginData[key]).map(item => {
              this.objectPropertiesArray[key].push({
                key: item,
                value: this.pluginData[key][item]
              })
            })
          }
          break
        case 'boolean':
          schemaKeys[key] = false
          break
        default:
          schemaKeys[key] = ''
      }
    }

    if (this.pluginData) {
      this.data = Object.assign(schemaKeys, this.pluginData)
    } else {
      this.data = schemaKeys
    }

    if (this.name === 'key-auth' && !this.pluginData) {
      this.data = {
        key: uuidv1()
      }

      this.isDataChanged = true
    }

    // Edit plugin data
    if (this.name === 'ip-restriction' && this.pluginData) {
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
        // Reorganize an array of object properties into objects
        this.data = Object.assign({}, this.data, this.reorganizeObjectProperty())
        this.data = this.processOneOfProp(this.data)
        this.$emit('save', this.name, this.data)
        this.$message.warning(`${this.$t('message.clickSaveButton')}`)
      } else {
        return false
      }
    })
  }

  /**
   * Add item to array property
   * @param key
   */
  private addArrayItem(key: any) {
    if (this.arrayPropertiesLength[key].length < this.schema.properties[key].maxItems) {
      this.arrayPropertiesLength[key].push(this.arrayPropertiesLength[key].length)
      this.$forceUpdate()
    } else {
      this.$message.warning(`${this.$t('message.cannotAddMoreItems')}`)
    }
  }

  /**
   * Add item to object property
   * @param key
   */
  private addObjectItem(key: any) {
    this.objectPropertiesArray[key].push({
      key: '',
      value: ''
    })
    this.isDataChanged = true
    this.$forceUpdate()
  }

  /**
   * Delete item form object property
   * @param key
   * @param index
   */
  private deleteObjectItem(key: any, index: number) {
    this.objectPropertiesArray[key].splice(index, 1)
    this.isDataChanged = true
    this.$forceUpdate()
  }

  /**
   * Reorganize an array of object properties into objects
   */
  private reorganizeObjectProperty() {
    let data = {}
    for (let i in this.objectPropertiesArray) {
      let objectItem = {}
      this.objectPropertiesArray[i].map((item: any) => {
        objectItem[item.key] = item.value
      })
      data[i] = objectItem
    }
    return data
  }

  /**
   * Force rerender on object property content changed
   */
  private onObjectPropertyChange() {
    this.isDataChanged = true
    this.$forceUpdate()
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
      // remove empty field
      for (let key in data) {
        if (data[key] === '') {
          delete data[key]
        }
        if (typeof data[key] === 'object' && Object.keys(data[key]).length === 0) {
          delete data[key]
        }
      }
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

  .array-input-container > * {
    display: flex;
    margin-top: 5px;
  }

  .object-input-container > * {
    display: flex;
    margin-top: 5px;
    :not(:first-child){
      margin-left: 5px;
    }
  }
}
</style>
