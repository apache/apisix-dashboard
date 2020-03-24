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
          filterable
          allow-create
          default-first-option
          :placeholder="$t('schema.route.inputMultipleValues')"
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
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="danger"
          @click.prevent="removeVar(item)"
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
import { Component, Vue, Watch } from 'vue-property-decorator'

@Component({
  name: 'VarArgs'
})
export default class extends Vue {
  private isFullscreen = false;
  private vars = [];
  private varNames = ['arg_id', 'arg_name'];

  private varOperator = ['==', '~=', '>', '<', '~~'];

  @Watch('vars', { immediate: true, deep: true })
  private onvarsChange() {
    console.log(this.vars)
    const val = this.vars.map(e => Object.values(e))
    this.$emit('onChange', val)
  }

  private addVar() {
    (this.vars as any).push({
      name: null,
      operator: null,
      value: 0
    })
  }

  private removeVar(item: any) {
    this.$confirm(`Do you want to remove the var?`, 'Warning', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })
      .then(async() => {
        const index = (this.vars as any).indexOf(item)
        if (index !== -1) {
          this.vars.splice(index, 1)
        }
      })
      .catch(() => {})
  }
}
</script>
