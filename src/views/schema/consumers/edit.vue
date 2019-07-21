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
          Add Plugin
        </el-button>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          @click="onSubmit"
        >
          Save
        </el-button>
        <el-button @click="toPreviousPage">
          Cancel
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
    plugins: {}
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
    const data: IDataWrapper<IConsumerData> = await get(username) as any

    (this.form as any) = {
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

        await updateOrCreateConsumer(Object.assign({}, this.form))

        this.$message.success(`${this.isEditMode ? 'Update the' : 'Create a'} consumer successfully!`)

        if (this.isEditMode) return

        this.$nextTick(() => {
          this.form = {
            username: '',
            plugins: {}
          }
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
}
</script>

<style lang='scss'>
.consumers-wrapper {
  padding: 20px;
  .el-form {
    .plugin-item {
      button {
        width: 150px;
      }
      .plugin-select {
        width: 150px;
      }
    }
  }
}
</style>
