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
  <div class="app-container">
    <div class="filter-container">
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        {{ $t('table.add') }}
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="tableData"
      :border="false"
      fit
      highlight-current-row
      style="width: 100%;"
      :default-sort="{prop: 'id', order: 'descending'}"
      @sort-change="sortChange"
    >
      <el-table-column
        v-for="(item, index) of tableKeys"
        :key="index"
        :label="item.key"
        :prop="item.key"
        :width="item.width"
        class-name="status-col"
      />
      <el-table-column
        :label="$t('table.actions')"
        align="center"
        width="230"
        class-name="fixed-width"
      >
        <template slot-scope="{row}">
          <el-button
            type="primary"
            size="mini"
            @click="handleToEdit(row)"
          >
            {{ $t('table.edit') }}
          </el-button>

          <el-button
            v-if="row.status!=='deleted'"
            size="mini"
            type="danger"
            @click="handleRemove(row)"
          >
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Form } from 'element-ui'

import Pagination from '@/components/Pagination/index.vue'

import { getSSLList, removeSSL } from '@/api/schema/ssl'

@Component({
  name: 'UpstreamList',
  components: {
    Pagination
  }
})
export default class extends Vue {
  private tableKey = 0
  private list = []
  private total = 0
  private listLoading = true
  private listQuery = {
    page: 1,
    limit: 20,
    importance: undefined,
    title: undefined,
    type: undefined,
    sort: '+id'
  }

  private tableData = []
  private tableKeys: any[] = []

  created() {
    this.getList()
  }

  private async getList() {
    this.listLoading = true

    this.tableKeys = [
      {
        key: 'id',
        width: 100
      }, {
        key: 'sni',
        width: 300
      }
    ]
    let { node: { nodes = [] } } = await getSSLList() as any
    nodes = [...nodes].map((item: any) => {
      const id = item.key.match(/\/([0-9]+)/)[1]
      const fakeId = parseInt(id.replace(/^(0+)/, ''))

      return {
        id: fakeId,
        realId: id,
        sni: item.value.sni
      }
    })

    this.tableData = nodes
    this.total = nodes.length

    setTimeout(() => {
      this.listLoading = false
    }, 0.5 * 1000)
  }

  private handleFilter() {
    this.listQuery.page = 1
    this.getList()
  }

  private handleRemove(row: any) {
    this.$confirm(`Do you want to remove ssl ${row.id}?`, 'Warning', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })
      .then(async() => {
        await removeSSL(row.realId)
        this.getList()
        this.$message.success(`Remove ssl ${row.id} successfully!`)
      })
  }

  private sortChange(data: any) {
    const { prop, order } = data
    if (prop === 'id') {
      this.sortByID(order)
    }
  }

  private sortByID(order: string) {
    if (order === 'ascending') {
      this.listQuery.sort = '+id'
    } else {
      this.listQuery.sort = '-id'
    }
    this.handleFilter()
  }

  private handleCreate() {
    this.$router.push({
      name: 'SchemaSSLCreate'
    })
  }

  private handleToEdit(row: any) {
    this.$router.push({
      name: 'SchemaSSLEdit',
      params: {
        id: row.realId
      }
    })
  }
}
</script>

<style lang="scss">
.app-container {
  .el-table::before {
    height: 0 !important;
  }
}
</style>
