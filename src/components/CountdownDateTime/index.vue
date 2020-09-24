<template>
  <div>
    {{ day }} 天 {{ hr }} 时 {{ min }} 分 {{ sec }} 秒
  </div>
</template>

<script>
export default {
  name: 'CountdownDateTime',
  props: {
    endTime: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      day: 0,
      hr: 0,
      min: 0,
      sec: 0,
      end: this.endTime
    }
  },
  mounted() {
    this.countdown()
  },
  methods: {
    countdown() {
      // 定义结束时间戳
      const end = Date.parse(this.end)
      // 定义当前时间戳
      const now = Date.now()
      // 做判断当倒计时结束时都为0
      if (now >= end) {
        this.day = 0
        this.hr = 0
        this.min = 0
        this.sec = 0
        return
      }
      // 用结束时间减去当前时间获得倒计时时间戳
      const msec = end - now
      const day = parseInt(msec / 1000 / 60 / 60 / 24) // 算出天数
      const hr = parseInt(msec / 1000 / 60 / 60 % 24)// 算出小时数
      const min = parseInt(msec / 1000 / 60 % 60)// 算出分钟数
      const sec = parseInt(msec / 1000 % 60)// 算出秒数
      // 给数据赋值
      this.day = day
      this.hr = hr > 9 ? hr : '0' + hr
      this.min = min > 9 ? min : '0' + min
      this.sec = sec > 9 ? sec : '0' + sec
      // 定义this指向
      const that = this
      // 使用定时器 然后使用递归 让每一次函数能调用自己达到倒计时效果
      setTimeout(() => {
        that.countdown()
      }, 1000)
    }
  }
}
</script>

<style scoped>

</style>
