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
    <div v-if="user">
      <el-row :gutter="20">
        <el-col
          :span="6"
          :xs="24"
        >
          <user-card :user="user" />
        </el-col>
        <el-col
          :span="18"
          :xs="24"
        >
          <el-card>
            <el-tabs v-model="activeTab">
              <el-tab-pane
                label="Activity"
                name="activity"
              >
                <activity />
              </el-tab-pane>
              <el-tab-pane
                label="Timeline"
                name="timeline"
              >
                <timeline />
              </el-tab-pane>
              <el-tab-pane
                label="Account"
                name="account"
              >
                <account :user="user" />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { UserModule } from '@/store/modules/user'
import Account from './components/Account.vue'
import Activity from './components/Activity.vue'
import Timeline from './components/Timeline.vue'
import UserCard from './components/UserCard.vue'

export interface IProfile {
  name: string
  email: string
  avatar: string
  roles: string
}

const defaultProfile: IProfile = {
  name: 'Loading...',
  email: 'Loading...',
  avatar: 'Loading...',
  roles: 'Loading...'
}

@Component({
  name: 'Profile',
  components: {
    Account,
    Activity,
    Timeline,
    UserCard
  }
})
export default class extends Vue {
  private user = defaultProfile
  private activeTab = 'activity'

  get name() {
    return UserModule.name
  }

  get email() {
    return UserModule.email
  }

  get avatar() {
    return UserModule.avatar
  }

  get roles() {
    return UserModule.roles
  }

  created() {
    this.getUser()
  }

  private getUser() {
    this.user = {
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      roles: this.roles.join(' | ')
    }
  }
}
</script>
