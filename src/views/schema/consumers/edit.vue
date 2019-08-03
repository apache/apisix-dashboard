<template>
  <div class="consumers-wrapper">
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
        label="name"
        prop="username"
      >
        <el-input v-model="form.username" />
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

import { getList, get, updateOrCreateConsumer } from '../../../api/schema/consumers'
import { getPluginList } from '@/api/schema/plugins'
import PluginDialog from '@/components/PluginDialog/index.vue'

import { IConsumerData, IDataWrapper } from '../../../api/types'
import { TagsViewModule } from '@/store/modules/tags-view'

@Component({
  name: 'ConsumerEdit',
  components: {
    PluginDialog
  }
})
export default class extends Vue {
  private isEditMode: boolean = false

  private form = {
    username: '',
    plugins: {},
    desc: ''
  }

  private rules = {
    username: {
      required: true
    }
  }

  private pluginList = []
  private pluginName: string = ''
  private showPluginDialog: boolean = false

  get filteredPluginList() {
    return this.pluginList.filter(item => !this.form.plugins.hasOwnProperty(item))
  }

  created() {
    this.isEditMode = (this.$route as any).name.indexOf('Create') === -1

    if (this.isEditMode) {
      this.getConsumerData()
    }

    this.getPluginList()
  }

  private async getConsumerData() {
    const username = this.$route.params.username
    const data = await get(username) as any

    (this.form as any) = {
      desc: data.node.value.desc,
      username,
      plugins: data.node.value.plugins
    }
  }

  private async getPluginList() {
    this.pluginList = await getPluginList() as any
  }

  private async addPlugin() {
    if (this.form.plugins.hasOwnProperty('tempPlugin')) return

    this.form.plugins = {
      ...this.form.plugins,
      tempPlugin: null
    }
  }

  private async onSubmit() {
    (this.$refs['form'] as any).validate(async(valid: boolean) => {
      if (valid) {
        delete this.form.plugins['tempPlugin']

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

        await updateOrCreateConsumer(Object.assign({}, data))

        this.$message.success(`${this.isEditMode ? 'Update the' : 'Create a'} consumer successfully!`)

        if (this.isEditMode) return

        TagsViewModule.delView(this.$route)
        this.$nextTick(() => {
          this.$router.push({
            name: 'SchemaConsumersList'
          })
        })
      } else {
        return false
      }
    })
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

  private toPreviousPage() {
    this.$router.go(-1)
  }

  private removePlugin(name: any) {
    this.$confirm(`Do you want to remove ${name} plugin?`, 'Warning', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })
      .then(async() => {
        Vue.delete(this.form.plugins, name)
      }).catch(() => {})
  }
}
</script>

<style lang='scss'>
.consumers-wrapper {
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
