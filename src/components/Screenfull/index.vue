<!--
#
# MIT License
#
# Copyright (c) 2018 Chong Guo
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
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
