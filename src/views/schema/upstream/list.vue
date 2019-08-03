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
      :span-method="objectSpanMethod"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        v-for="(item, index) of tableKeys"
        :key="index"
        :label="item.key"
        :prop="item.key"
        :width="item.width"
        :class-name="item.align === 'left' ? '' : 'status-col'"
        header-align="center"
      >
        <template v-if="item.key === 'nodes'">
          <el-table-column
            label="IP"
            width="150"
            prop="ip"
            class-name="status-col"
          />

          <el-table-column
            label="Port"
            width="150"
            prop="port"
            class-name="status-col"
          />

          <el-table-column
            label="Weights"
            width="150"
            prop="weights"
            class-name="status-col"
          />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.actions')"
        align="center"
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

import Pagination from '../../../components/Pagination/index.vue'

import { getUpstreamList, removeUpstream } from '../../../api/schema/upstream'

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

  private tableData: any[] = []
  private tableKeys: any[] = []
  private spanArr: any[] = []
  private position = 0

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
        key: 'description',
        width: 300,
        align: 'left'
      }, {
        key: 'type',
        width: 200
      }, {
        key: 'nodes',
        width: 'auto'
      }
    ]

    let { node: { nodes = [] } } = await getUpstreamList() as any
    nodes = [...nodes].map((item: any) => {
      const id = item.key.match(/\/([0-9]+)/)[1]
      const fakeId = id.replace(/(0+)/, '')
      const type = item.value.type
      const desc = item.value.desc

      return {
        id: fakeId,
        realId: id,
        type,
        nodes: item.value.nodes,
        description: desc
      }
    })

    let tableData: any[] = []
    const arr = nodes.forEach((item: any) => {
      Object.entries(item.nodes).forEach(([key, value]) => {
        tableData = tableData.concat({
          ...item,
          ip: key.split(':')[0],
          port: key.split(':')[1],
          weights: value
        })
      })
    })

    this.tableData = tableData
    this.rowspan(0, 'id')
    this.rowspan(1, 'description')
    this.rowspan(2, 'type')

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
    this.$confirm(`Do you want to remove router ${row.id}?`, 'Warning', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })
      .then(async() => {
        await removeUpstream(row.realId)
        this.getList()
        this.$message.success(`Remove router ${row.id} successfully!`)
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
      name: 'SchemaUpstreamCreate'
    })
  }

  private handleToEdit(row: any) {
    this.$router.push({
      name: 'SchemaUpstreamEdit',
      params: {
        id: row.realId
      }
    })
  }

  private rowspan(idx: number, prop: any) {
    this.spanArr[idx] = []
    this.position = 0
    this.tableData.forEach((item, index) => {
      if (index === 0) {
        this.spanArr[idx].push(1)
        this.position = 0
      } else {
        if (this.tableData[index][prop] === this.tableData[index - 1][prop]) {
          this.spanArr[idx][this.position] += 1
          this.spanArr[idx].push(0)
        } else {
          this.spanArr[idx].push(1)
          this.position = index
        }
      }
    })
  }

  private objectSpanMethod({ row, column, rowIndex, columnIndex }: any) {
    if (columnIndex === 6) {
      return {
        rowspan: this.spanArr[0][rowIndex],
        colspan: this.spanArr[0][rowIndex] > 0 ? 1 : 0
      }
    }

    if (columnIndex < 3) {
      return {
        rowspan: this.spanArr[0][rowIndex],
        colspan: this.spanArr[0][rowIndex] > 0 ? 1 : 0
      }
    }
  }
}
</script>
