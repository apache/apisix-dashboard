<template>
  <div class="plugin-dialog">
    <el-dialog
      :title="'Plugin ' + name + ' Edit'"
      :visible.sync="show"
    >
      <el-form
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
          :disabled="!isDataChanged"
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

  @Watch('show')
  private onShowChange(value: boolean) {
    this.resetPlugin()
    if (value) {
      this.getschema(this.name)
    }
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

    if (!schema.properties) return

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
    }
  }

  private onCancel() {
    this.$emit('hidePlugin')
  }

  private onSave() {
    (this.$refs.form as any).validate((valid: boolean) => {
      // 标记该插件数据是否通过校验
      if (valid) {
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
}
</style>
