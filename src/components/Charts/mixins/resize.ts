/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ECharts } from 'echarts'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'ResizeMixin'
})
export default class extends Vue {
  protected chart!: ECharts | null
  private sidebarElm?: Element

  mounted() {
    this.initResizeEvent()
    this.initSidebarResizeEvent()
  }

  beforeDestroy() {
    this.destroyResizeEvent()
    this.destroySidebarResizeEvent()
  }

  activated() {
    this.initResizeEvent()
    this.initSidebarResizeEvent()
  }

  deactivated() {
    this.destroyResizeEvent()
    this.destroySidebarResizeEvent()
  }

  private chartResizeHandler() {
    if (this.chart) {
      this.chart.resize()
    }
  }

  private sidebarResizeHandler(e: TransitionEvent) {
    if (e.propertyName === 'width') {
      this.chartResizeHandler()
    }
  }

  private initResizeEvent() {
    if (this.chartResizeHandler) {
      window.addEventListener('resize', this.chartResizeHandler)
    }
  }

  private destroyResizeEvent() {
    if (this.chartResizeHandler) {
      window.removeEventListener('resize', this.chartResizeHandler)
    }
  }

  private initSidebarResizeEvent() {
    this.sidebarElm = document.getElementsByClassName('sidebar-container')[0]
    if (this.sidebarElm) {
      this.sidebarElm.addEventListener('transitionend', this.sidebarResizeHandler as EventListener)
    }
  }

  private destroySidebarResizeEvent() {
    if (this.sidebarElm) {
      this.sidebarElm.removeEventListener('transitionend', this.sidebarResizeHandler as EventListener)
    }
  }
}
