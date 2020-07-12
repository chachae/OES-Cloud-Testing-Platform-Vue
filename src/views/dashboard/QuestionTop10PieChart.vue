<template>
  <div class="app-container">
    <div>各科目试题量前十排行</div>
    <div id="top10question" style="width: 100%;height: 350px" />
  </div>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from '@/components/Charts/mixins/resize'

export default {
  mixins: [resize],
  props: {
    topTenQuestion: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      chart: null,
      courses: []
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
      this.topTenQuestion.forEach((map) => {
        this.courses.push(map.name)
      })

      this.chart = echarts.init(document.getElementById('top10question'), 'macarons')
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
          orient: 'vertical',
          left: 'left',
          bottom: '10',
          data: this.courses
        },
        series: [
          {
            name: '对应课程题目信息',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 95],
            center: ['50%', '38%'],
            data: this.topTenQuestion,
            label: {
              normal: {
                show: true,
                formatter: '{b}: {c} ({d}%)',
                textStyle: {
                  fontWeight: 'bold'
                }
              }
            },
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    }
  }
}
</script>
