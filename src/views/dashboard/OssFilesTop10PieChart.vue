<template>
  <div class="app-container">
    <div>分布式对象存储中心文件类型统计</div>
    <div id="top10files" style="width: 100%;height: 350px" />
  </div>
</template>

<script>
const echarts = require('echarts/lib/echarts')
require('echarts/theme/macarons') // echarts theme
import resize from '@/components/Charts/mixins/resize'

export default {
  mixins: [resize],
  data() {
    return {
      chart: null,
      list: [],
      suffixs: []
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
      this.$get('oss-qiniu/content/top10').then((r) => {
        this.list = r.data.data
        this.list.forEach((map) => {
          this.suffixs.push(map.name)
        })

        this.chart = echarts.init(document.getElementById('top10files'), 'macarons')
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
            data: this.suffixs
          },
          series: [
            {
              name: '文件类型信息',
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
              data: this.list,
              animationEasing: 'cubicInOut',
              animationDuration: 2600
            }
          ]
        })
      })
    }
  }
}
</script>
