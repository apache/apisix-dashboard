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
  <el-form>
    <el-form-item
      v-for="(item, index) in vars"
      :key="index"
      :label="'Var' + (index + 1)"
      class="var-item"
    >
      <el-form-item :prop="'var.' + index + '.ip'">
        <el-select
          v-model="item.name"
          :placeholder="$t('schema.route.inputMultipleValues')"
          filterable
          allow-create
          default-first-option
          @change="onChange"
        >
          <el-option
            v-for="name in varNames"
            :key="name"
            :label="name"
            :value="name"
          />
        </el-select>
        <el-select
          v-model="item.operator"
          placeholder="Operator"
          @change="onChange"
        >
          <el-option
            v-for="operator in varOperator"
            :key="operator"
            :label="operator"
            :value="operator"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="item.value"
          placeholder=""
          @input="onChange"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="danger"
          @click.prevent="removeVar(index)"
        >
          {{ $t("button.delete") }}
        </el-button>
      </el-form-item>
    </el-form-item>
    <el-form-item>
      <el-button @click="addVar">
        {{ $t("button.add_var") }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'

@Component({
  name: 'VarArgs'
})
export default class extends Vue {
  @Prop({ default: () => [] }) private pVars!: any
  private isFullscreen = false;
  private get vars() {
    const _vars = this.pVars.map((arr:Array<any>) => {
      const [name, operator, value] = arr
      return { name, operator, value }
    })
    return _vars
  }
  private varNames = ['remote_addr', 'host', 'uri', 'http_user_agent', 'http_referer', 'http_cookie', 'http_accept_language', 'request_uri', 'query_string', 'remote_port', 'hostname', 'arg_id'];

  private varOperator = ['==', '~=', '>', '<', '~~'];

  private onChange() {
    const val = this.vars.map((e:any) => Object.values(e))
    this.$emit('update:pVars', val)
  }

  private addVar() {
    (this.vars as any).push({
      name: null,
      operator: null,
      value: null
    })
    this.onChange()
  }

  private removeVar(index:number) {
    this.$confirm('Do you want to remove the var?', 'Warning', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })
      .then(async() => {
        this.vars.splice(index, 1)
        this.onChange()
      })
      .catch(() => {})
  }
}
</script>
