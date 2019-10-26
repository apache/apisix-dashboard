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
  <div v-if="errorLogs.length>0">
    <el-badge
      :is-dot="true"
      style="line-height: 25px; margin-top: -5px;"
      @click.native="dialogTableVisible=true"
    >
      <el-button
        style="padding: 8px 10px;"
        size="small"
        type="danger"
      >
        <svg-icon name="bug" />
      </el-button>
    </el-badge>

    <el-dialog
      :visible.sync="dialogTableVisible"
      width="80%"
      append-to-body
    >
      <div slot="title">
        <span style="padding-right: 10px;">Error Log</span>
        <el-button
          size="mini"
          type="primary"
          icon="el-icon-delete"
          @click="clearAll"
        >
          Clear All
        </el-button>
      </div>
      <el-table
        :data="errorLogs"
        border
      >
        <el-table-column label="Message">
          <template slot-scope="{row}">
            <div>
              <span class="message-title">Msg:</span>
              <el-tag type="danger">
                {{ row.err.message }}
              </el-tag>
            </div>
            <br>
            <div>
              <span
                class="message-title"
                style="padding-right: 10px;"
              >Info: </span>
              <el-tag type="warning">
                {{ row.vm.$vnode.tag }} error in {{ row.info }}
              </el-tag>
            </div>
            <br>
            <div>
              <span
                class="message-title"
                style="padding-right: 16px;"
              >Url: </span>
              <el-tag type="success">
                {{ row.url }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Stack">
          <template slot-scope="scope">
            {{ scope.row.err.stack }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ErrorLogModule } from '@/store/modules/error-log'

@Component({
  name: 'ErrorLog'
})
export default class extends Vue {
  private dialogTableVisible = false

  get errorLogs() {
    return ErrorLogModule.logs
  }

  private clearAll() {
    this.dialogTableVisible = false
    ErrorLogModule.ClearErrorLog()
  }
}
</script>

<style lang="scss" scoped>
.message-title {
  font-size: 16px;
  color: #333;
  font-weight: bold;
  padding-right: 8px;
}
</style>
