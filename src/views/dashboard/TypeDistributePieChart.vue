<template>
  <div class="app-container">
    <div>各题型题量分布</div>
    <div id="countTypeDistribute" style="width: 100%;height: 350px" />
  </div>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from '@/components/Charts/mixins/resize'

export default {
  mixins: [resize],
  props: {
    typeCountDistribute: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      chart: null,
      typeNames: []
    }
  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.typeCountDistribute.forEach((map) => {
        this.typeNames.push(map.name)
      })

      this.chart = echarts.init(document.getElementById('countTypeDistribute'), 'macarons')
      this.chart.setOption({
        backgroundColor: '#FFF',
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
          textStyle: {
            fontWeight: 'bold'
          }
        },
        legend: {
          left: 'center',
          bottom: '10',
          data: this.typeNames
        },
        series: [
          {
            name: '题目数量',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 95],
            center: ['50%', '38%'],
            label: {
              normal: {
                show: true,
                formatter: '{b}: {c} ({d}%)',
                textStyle: {
                  fontWeight: 'bold'
                }
              }
            },
            data: this.typeCountDistribute,
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    }
  }
}
</script>
