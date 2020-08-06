<template>
  <div class="app-container">
    <div>{{ title }}</div>
    <div :id="id" :style="{height:height,width:width}" />
  </div>
</template>

<script>
import theme from '@/styles/echarts-theme.json' // echarts theme
import echarts from 'echarts'
import resize from './mixins/resize'

export default {
  mixins: [resize],
  props: {
    title: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      required: true
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    legendData: {
      type: Array,
      required: true
    },
    seriesData: {
      type: Array,
      required: true
    },
    seriesName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    seriesData(newVal, oldVal) {
      this.initChart()
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
      this.chart = echarts.init(document.getElementById(this.id), theme)
      this.chart.setOption({
        backgroundColor: '#FFF',
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          bottom: '10',
          data: this.legendData
        },
        series: [
          {
            name: this.seriesName,
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
            data: this.seriesData,
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    }
  }
}
</script>
