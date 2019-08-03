<template>
  <div class="container">
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="80px"
      :show-message="false"
    >
      <el-form-item
        label="Desc"
      >
        <el-input
          v-model="form.desc"
          placeholder="Description"
        />
      </el-form-item>

      <el-form-item
        label="Type"
        prop="type"
      >
        <el-select
          v-model="form.type"
          placeholder="Select a Type"
          @change="typeSelectorChange"
        >
          <el-option
            v-for="item in types"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        label="Key"
      >
        <el-input
          v-model="form.key"
          placeholder="Input a Key"
          :disabled="form.type !== 'chash'"
        />
      </el-form-item>

      <el-form-item
        v-for="(item, index) in form.nodes"
        :key="index"
        :label="'Node' + (index + 1)"
        class="node-item"
      >
        <el-form-item
          :rules="[{required: true, pattern: /((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/g, type: 'string'}]"
          :prop="'nodes.' + index + '.ip'"
        >
          <el-input
            v-model="item.ip"
            placeholder="IP"
          />
        </el-form-item>
        <el-form-item
          :rules="[{required: true}]"
          :prop="'nodes.' + index + '.port'"
        >
          <el-input
            v-model="item.port"
            placeholder="Port"
            type="number"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="item.weights"
            placeholder="Weights"
            type="number"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="danger"
            @click.prevent="removeNode(item)"
          >
            {{ $t('button.delete') }}
          </el-button>
        </el-form-item>
      </el-form-item>

      <el-form-item>
        <el-button
          @click="addNode"
        >
          {{ $t('button.add_node') }}
        </el-button>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          @click="onSubmit"
        >
          {{ $t('button.save') }}
        </el-button>
        <el-button @click="toPreviousPage">
          {{ $t('button.cancel') }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { Form } from 'element-ui'

import { getUpstream, createUpstream, updateStream } from '../../../api/schema/upstream'
import { TagsViewModule } from '@/store/modules/tags-view'

@Component({
  name: 'RouterEdit'
})
export default class extends Vue {
  private form = {
    type: null,
    key: null,
    nodes: [],
    desc: ''
  }

  private rules = {
    type: {
      required: true
    }
  }
  private isEditMode: boolean = false

  private types = ['roundrobin', 'chash']

  created() {
    this.isEditMode = (this.$route as any).name.indexOf('Create') === -1

    if (this.isEditMode) {
      this.getData()
    }
  }

  private async getData() {
    const { id } = this.$route.params
    let {
      node: {
        value: {
          type = null,
          nodes = [],
          key = null,
          desc = ''
        }
      }
    } = (await getUpstream(id)) as any

    nodes = Object.entries(nodes).map(([key, value]) => {
      const ip = key.split(':')[0]
      const port = key.split(':')[1]
      const weights = value
      return {
        ip, port, weights
      }
    })

    this.form = {
      type,
      key,
      nodes,
      desc
    }
  }

  private async onSubmit() {
    (this.$refs.form as any).validate(async(valid: boolean) => {
      console.log('onSubmit', this.form)

      const nodes = {}
      this.form.nodes.map((item: any) => {
        if (item.ip && item.port && String(item.weights)) {
          nodes[`${item.ip}:${item.port}`] = Number(item.weights)
        }
      })

      if (valid) {
        let data = {
          ...this.form,
          nodes
        }

        if (!(this.form.nodes as any[]).length) {
          this.$message.error('Please add 1 node at least!')
          return
        }

        if (data.type !== 'chash') {
          delete data.key
        }

        Object.entries(data).forEach(([key, value]) => {
          if (value === '' || value === null) {
            delete data[key]
          }
        })

        if (this.isEditMode) {
          await updateStream(this.$route.params.id, data)
        } else {
          await createUpstream(data)
        }

        this.$message.success(`${this.isEditMode ? 'Update the' : 'Create a'} upstream successfully!`)

        if (!this.isEditMode) {
          TagsViewModule.delView(this.$route)
          this.$nextTick(() => {
            this.$router.push({
              name: 'SchemaUpstreamList'
            })
          })
        }
      } else {
        return false
      }
    })
  }

  private toPreviousPage() {
    this.$router.go(-1)
  }

  private typeSelectorChange(type: string) {
    if (type !== 'chash') {
      this.form.key = null
    }
  }

  private addNode() {
    (this.form.nodes as any).push({
      ip: null,
      port: null,
      weights: null
    })
  }

  private removeNode(item: any) {
    const index = (this.form.nodes as any).indexOf(item)
    if (index !== -1) {
      this.form.nodes.splice(index, 1)
    }
  }
}
</script>

<style lang='scss'>
.container {
  padding: 20px;
  .el-form-item {
    .el-form-item__content {
      .el-input {
        width: 193px;
      }
    }
  }
  .node-item {
    .el-form-item {
      margin-bottom: 10px;
      display: inline-block;
      .el-form-item__label {}
      .el-form-item__content {
        margin-right: 10px;
      }
    }
  }
}
</style>
