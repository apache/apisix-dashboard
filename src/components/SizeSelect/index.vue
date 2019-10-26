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
  <el-dropdown
    id="size-select"
    trigger="click"
    @command="handleSetSize"
  >
    <div>
      <svg-icon
        class="size-icon"
        name="size"
      />
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item
        v-for="item of sizeOptions"
        :key="item.value"
        :disabled="size===item.value"
        :command="item.value"
      >
        {{
          item.label }}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { AppModule } from '@/store/modules/app'
import { TagsViewModule } from '@/store/modules/tags-view'

@Component({
  name: 'SizeSelect'
})
export default class extends Vue {
  private sizeOptions = [
    { label: 'Default', value: 'default' },
    { label: 'Medium', value: 'medium' },
    { label: 'Small', value: 'small' },
    { label: 'Mini', value: 'mini' }
  ]

  get size() {
    return AppModule.size
  }

  private handleSetSize(size: string) {
    (this as any).$ELEMENT.size = size
    AppModule.SetSize(size)
    this.refreshView()
    this.$message({
      message: 'Switch Size Success',
      type: 'success'
    })
  }

  private refreshView() {
    // In order to make the cached page re-rendered
    TagsViewModule.delAllCachedViews()
    const { fullPath } = this.$route
    this.$nextTick(() => {
      this.$router.replace({
        path: '/redirect' + fullPath
      })
    })
  }
}
</script>
