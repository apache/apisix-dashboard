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
  <div class="block">
    <el-timeline>
      <el-timeline-item
        v-for="(item, index) of timeline"
        :key="index"
        :timestamp="item.timestamp"
        placement="top"
      >
        <el-card>
          <h4>{{ item.title }}</h4>
          <p>{{ item.content }}</p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'Timeline'
})
export default class extends Vue {
  private timeline = [
    {
      timestamp: '2019/4/20',
      title: 'Update Github template',
      content: 'Armour committed 2019/4/20 20:46'
    },
    {
      timestamp: '2019/4/21',
      title: 'Update Github template',
      content: 'Armour committed 2019/4/21 20:46'
    },
    {
      timestamp: '2019/4/22',
      title: 'Build Template',
      content: 'Armour committed 2019/4/22 20:46'
    },
    {
      timestamp: '2019/4/23',
      title: 'Release New Version',
      content: 'Armour committed 2019/4/23 20:46'
    }
  ]
}
</script>
