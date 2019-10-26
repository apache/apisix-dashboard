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
  <div id="screenfull">
    <svg-icon
      :name="isFullscreen? 'exit-fullscreen': 'fullscreen'"
      @click="click"
    />
  </div>
</template>

<script lang="ts">
import screenfull from 'screenfull'
import { Component, Vue } from 'vue-property-decorator'

const sf = screenfull

@Component({
  name: 'Screenfull'
})
export default class extends Vue {
  private isFullscreen = false

  mounted() {
    if (sf && sf.enabled) {
      sf.on('change', this.change)
    }
  }

  beforeDestory() {
    if (sf && sf.enabled) {
      sf.off('change', this.change)
    }
  }

  private change() {
    if (sf && sf.enabled) {
      this.isFullscreen = sf.isFullscreen
    }
  }

  private click() {
    if (sf) {
      if (!sf.enabled) {
        this.$message({
          message: 'you browser can not work',
          type: 'warning'
        })
        return false
      }
      sf.toggle()
    }
  }
}
</script>
