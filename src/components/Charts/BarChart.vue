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
  <div
    :id="id"
    :class="className"
    :style="{height: height, width: width}"
  />
</template>

<script lang="ts">
import echarts, { EChartOption } from 'echarts'
import { Component, Prop } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import ResizeMixin from './mixins/resize'

@Component({
  name: 'BarChart'
})
export default class extends mixins(ResizeMixin) {
  @Prop({ default: 'chart' }) private className!: string
  @Prop({ default: 'chart' }) private id!: string
  @Prop({ default: '200px' }) private width!: string
  @Prop({ default: '200px' }) private height!: string

  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  }

  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  }

  private initChart() {
    this.chart = echarts.init(document.getElementById(this.id) as HTMLDivElement)
    const xAxisData: string[] = []
    const data: number[] = []
    const data2: number[] = []
    for (let i = 0; i < 50; i++) {
      xAxisData.push(i.toString())
      data.push((Math.sin(i / 5) * (i / 5 - 10) + i / 6) * 5)
      data2.push((Math.sin(i / 5) * (i / 5 + 10) + i / 6) * 3)
    }
    this.chart.setOption({
      backgroundColor: '#08263a',
      grid: {
        left: '5%',
        right: '5%'
      },
      xAxis: [{
        show: false,
        data: xAxisData
      }, {
        show: false,
        data: xAxisData
      }],
      visualMap: [{
        show: false,
        min: 0,
        max: 50,
        dimension: 0,
        inRange: {
          color: ['#4a657a', '#308e92', '#b1cfa5', '#f5d69f', '#f5898b', '#ef5055']
        }
      }],
      yAxis: [{
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#43657a'
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#08263f'
          }
        },
        axisTick: {
          show: false
        }
      }],
      series: [{
        name: 'back',
        type: 'bar',
        data: data2,
        z: 1,
        itemStyle: {
          opacity: 0.4,
          barBorderRadius: 5,
          shadowBlur: 3,
          shadowColor: '#111'
        }
      }, {
        name: 'Simulate Shadow',
        type: 'line',
        data,
        z: 2,
        showSymbol: false,
        animationDelay: 0,
        animationEasing: 'linear',
        animationDuration: 1200,
        lineStyle: {
          color: 'transparent'
        },
        areaStyle: {
          color: '#08263a',
          shadowBlur: 50,
          shadowColor: '#000'
        }
      }, {
        name: 'front',
        type: 'bar',
        data,
        xAxisIndex: 1,
        z: 3,
        itemStyle: {
          barBorderRadius: 5
        }
      }],
      animationEasing: 'elasticOut',
      animationEasingUpdate: 'elasticOut',
      animationDelay(idx: number) {
        return idx * 20
      },
      animationDelayUpdate(idx: number) {
        return idx * 20
      }
    } as EChartOption<EChartOption.SeriesBar>)
  }
}
</script>
