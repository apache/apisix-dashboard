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
        label="Upstream"
      >
        <el-select
          v-model="form.upstream_id"
          placeholder="Upstream"
        >
          <el-option
            v-for="item in upstreamList"
            :key="item.id"
            :label="item.desc"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        v-for="(index, item) in form.plugins"
        :key="item"
        :label="&quot;plugin&quot;"
        class="plugin-item"
      >
        <el-button
          v-if="item !== 'tempPlugin'"
          type="info"
          plain
          @click="showPlugin(item)"
        >
          {{ item }}
        </el-button>

        <el-button
          v-if="item !== 'tempPlugin'"
          type="danger"
          @click.prevent="removePlugin(item)"
        >
          {{ $t('button.delete') }}
        </el-button>

        <el-select
          v-if="item === 'tempPlugin'"
          :value="null"
          class="plugin-select"
          placeholder="Select a Plugin"
          @change="showPlugin"
        >
          <el-option
            v-for="name in filteredPluginList"
            :key="name"
            :label="name"
            :value="name"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button
          :disabled="!filteredPluginList.length"
          @click="addPlugin"
        >
          {{ $t('button.add_plugin') }}
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
    <PluginDialog
      :show="showPluginDialog"
      :name="pluginName"
      :plugin-data="form.plugins[pluginName]"
      @hidePlugin="showPluginDialog = false"
      @save="onPluginSave"
    />
  </div>
</template>

<script lang='ts'>
import { Component, Vue } from 'vue-property-decorator'
import { Form } from 'element-ui'

import PluginDialog from '@/components/PluginDialog/index.vue'

import { getUpstreamList } from '@/api/schema/upstream'
import { getService, createService, updateService } from '@/api/schema/services'
import { getPluginList } from '@/api/schema/plugins'
import { TagsViewModule } from '@/store/modules/tags-view'

@Component({
  name: 'RouterEdit',
  components: {
    PluginDialog
  }
})
export default class extends Vue {
  private form = {
    plugins: {},
    upstream_id: '',
    desc: ''
  }

  private rules = {}
  private isEditMode: boolean = false

  private pluginList = []
  private pluginName: string = ''
  private showPluginDialog: boolean = false
  private upstreamList = []

  created() {
    this.isEditMode = (this.$route as any).name.indexOf('Create') === -1

    this.getUpstreamList()
    this.getPluginList()

    if (this.isEditMode) {
      this.getData()
    }
  }

  get filteredPluginList() {
    return this.pluginList.filter(item => !this.form.plugins.hasOwnProperty(item))
  }

  private toPreviousPage() {
    this.$router.go(-1)
  }

  private async getData() {
    const { id } = this.$route.params
    let {
      node: {
        value: {
          plugins = {},
          upstream_id = '',
          desc = ''
        }
      }
    } = (await getService(id)) as any

    this.form = {
      plugins,
      upstream_id,
      desc
    }
  }

  private async getUpstreamList() {
    const {
      node: {
        nodes = []
      }
    } = await getUpstreamList() as any

    this.upstreamList = nodes.map((item: any) => {
      const id = item.key.match(/\/([0-9]+)/)[1]
      return {
        ...item,
        id
      }
    })
  }

  private async getPluginList() {
    this.pluginList = await getPluginList() as any
  }

  private async showPlugin(name: string) {
    this.pluginName = name
    this.showPluginDialog = true
  }

  private onPluginSave(name: string, data: any) {
    delete this.form.plugins['tempPlugin']
    this.showPluginDialog = false
    this.form.plugins[name] = data
  }

  private async addPlugin() {
    if (this.form.plugins.hasOwnProperty('tempPlugin')) return

    this.form.plugins = {
      ...this.form.plugins,
      tempPlugin: null
    }
  }

  private async onSubmit() {
    (this.$refs.form as any).validate(async(valid: boolean) => {
      console.log('onSubmit', this.form)

      if (valid) {
        let data = Object.assign({}, this.form)
        Object.entries(data).forEach(([key, value]) => {
          if (typeof data[key] === 'object') {
            if (key !== 'plugins' && Object.keys(value).length === 0) {
              delete data[key]
            }
          } else {
            if (value === '') {
              delete data[key]
            }
          }
        })

        if (this.isEditMode) {
          await updateService(this.$route.params.id, data)
        } else {
          await createService(data)
        }

        this.$message.success(`${this.isEditMode ? 'Update the' : 'Create a'} service successfully!`)

        if (!this.isEditMode) {
          TagsViewModule.delView(this.$route)
          this.$nextTick(() => {
            this.$router.push({
              name: 'SchemaServiceList'
            })
          })
        }
      } else {
        return false
      }
    })
  }

  private removePlugin(name: any) {
    Vue.delete(this.form.plugins, name)
  }
}
</script>

<style lang='scss'>
.container {
  padding: 20px;
  .el-form {
    .el-form-item {
      .el-form-item__content {
        .el-input {
          width: 220px;
        }
      }
    }
  }
}
</style>
