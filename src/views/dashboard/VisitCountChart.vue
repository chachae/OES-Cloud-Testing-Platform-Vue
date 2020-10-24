<template>
  <div class="app-container">
    <div>最近十天系统访问量</div>
    <div id="visit-count-chart" style="width: 100%;height: 350px" />
  </div>
</template>

<script>
import echarts from 'echarts'
import { parseTime } from '@/utils'
import resize from '@/components/Charts/mixins/resize'
export default {
  name: 'VisitCountChart',
  mixins: [resize],
  props: {
    lastTenVisitCount: {
      type: Array,
      required: true
    },
    lastTenUserVisitCount: {
      type: Array,
      required: true
    }
  },
  mounted() {
    this.initIndexData()
  },
  methods: {
    initIndexData() {
      const tenVisitCount = []
      const dateArr = []
      for (let i = 10; i >= 0; i--) {
        const time = parseTime(new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * i), '{m}-{d}')
        let contain = false
        for (const o of this.lastTenVisitCount) {
          if (o.days === time) {
            contain = true
            tenVisitCount.push(o.count)
          }
        }
        if (!contain) {
          tenVisitCount.push(0)
        }
        dateArr.push(time)
      }
      const tenUserVisitCount = []
      for (let i = 10; i >= 0; i--) {
        const time = parseTime(new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * i), '{m}-{d}')
        let contain = false
        for (const o of this.lastTenUserVisitCount) {
          if (o.days === time) {
            contain = true
            tenUserVisitCount.push(o.count)
          }
        }
        if (!contain) {
          tenUserVisitCount.push(0)
        }
      }
      this.chart = echarts.init(document.getElementById('visit-count-chart'))
      const option = {
        backgroundColor: '#FFF',
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: [this.$t('common.you'), this.$t('common.total')],
          top: '18'
        },
        grid: {
          left: '3%',
          right: '5%',
          bottom: '3%',
          containLabel: true,
          show: false
        },
        toolbox: {
          feature: {
            dataView: { show: false, readOnly: false }
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: true,
          splitLine: {
            show: false
          },
          data: dateArr,
          axisLine: {
            lineStyle: {
              color: '#333'
            }
          }
        },
        yAxis: [
          {
            type: 'value',
            splitLine: {
              lineStyle: {
                type: 'dashed',
                color: '#DDD'
              }
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: '#333'
              }
            },
            nameTextStyle: {
              color: '#999'
            },
            splitArea: {
              show: false
            }
          }],
        series: [
          {
            name: this.$t('common.you'),
            smooth: true,
            type: 'line',
            color: 'rgb(88, 143, 255)',
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0,
                  color: 'rgba(88, 143, 255,1)'
                },
                {
                  offset: 1,
                  color: '#fff'
                }
                ],
                globalCoord: false
              }
            },
            lineStyle: {
              normal: {
                width: 3
              }
            },
            data: tenUserVisitCount
          },
          {
            name: this.$t('common.total'),
            smooth: true,
            type: 'line',
            color: 'rgba(82, 222, 151, 1)',
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0,
                  color: 'rgba(82, 222, 151, 0.8)'
                },
                {
                  offset: 1,
                  color: '#fff'
                }
                ],
                globalCoord: false
              }
            },
            lineStyle: {
              normal: {
                width: 3
              }
            },
            data: tenVisitCount
          }
        ]
      }
      this.chart.setOption(option)
    }
  }
}
</script>

<style scoped>

</style>
