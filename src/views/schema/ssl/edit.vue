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
        label="SNI"
        prop="sni"
      >
        <el-input
          v-model="form.sni"
          placeholder="SNI"
        />
      </el-form-item>

      <el-form-item
        label="CERT"
        prop="cert"
      >
        <el-input
          v-model="form.cert"
          placeholder="CERT"
          type="textarea"
          :rows="7"
        />
      </el-form-item>

      <el-form-item
        label="KEY"
        prop="key"
      >
        <el-input
          v-model="form.key"
          placeholder="KEY"
          type="textarea"
          :rows="7"
        />
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

import { TagsViewModule } from '@/store/modules/tags-view'
import { getSSL, updateSSL, createSSL } from '@/api/schema/ssl'

@Component({
  name: 'RouterEdit'
})
export default class extends Vue {
  private form = {
    sni: '',
    cert: '',
    key: ''
  };

  private rules = {
    sni: {
      required: true
    },
    cert: {
      required: true
    },
    key: {
      required: true
    }
  }
  private isEditMode: boolean = false;

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
          sni = '',
          cert = '',
          key = ''
        }
      }
    } = (await getSSL(id)) as any

    this.form = {
      sni,
      cert,
      key
    }
  }

  private async onSubmit() {
    (this.$refs.form as any).validate(async(valid: boolean) => {
      console.log('onSubmit', this.form)

      if (valid) {
        const data = Object.assign({}, this.form)

        if (this.isEditMode) {
          await updateSSL(this.$route.params.id, data)
        } else {
          await createSSL(data)
        }

        this.$message.success(
          `${this.isEditMode ? 'Update the' : 'Create a'} ssl successfully!`
        )

        if (!this.isEditMode) {
          TagsViewModule.delView(this.$route)
          this.$nextTick(() => {
            this.$router.push({
              name: 'SchemaSSLList'
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
}
</script>

<style lang='scss'>
.container {
  padding: 20px;
  .el-form-item {
    .el-form-item__content {
      .el-input {
        width: 220px;
      }
      .el-textarea {
        width: 220px;
      }
    }
  }
}
</style>
