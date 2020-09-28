<!-- 正确/错误答案显示处理 -->
<template>
  <div>
    <!-- 填空题处理 -->
    <div v-if="typeId === 4 && initRightKeys">
      <p>
        <strong :style="styles[componentType]">
          <i :class="icons[componentType]" />
          {{ title }}
        </strong>
      </p>
      <div v-for="(item,index) in rightKeys" :key="index">
        <p>
          <i class="el-icon-check" />&nbsp;<strong>填空 {{ index + 1 }} : </strong>{{ item }}
        </p>
      </div>
    </div>
    <!-- 其他题目 -->
    <div v-if="typeId !== 4">
      <p>
        <strong :style="styles[componentType]">
          <i :class="icons[componentType]" />
          {{ title }} :
        </strong>
        {{ rightKeys }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FillRightKey',
  props: {
    rightKey: {
      type: String,
      required: true
    },
    typeId: {
      type: Number,
      required: true
    },
    componentType: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      rightKeys: null,
      initRightKeys: false,
      title: '',
      styles: [{ color: '#F56C6C' }, { color: '#67C23A' }],
      icons: ['el-icon-circle-close', 'el-icon-circle-check']
    }
  },
  mounted() {
    this.calComponentType()
    this.parseRightKey()
  },
  methods: {
    calComponentType() {
      this.title = this.componentType === 1 ? '正确答案' : '考生答案'
    },

    parseRightKey() {
      if (this.typeId === 2) {
        this.parseMultiChoiceRightKey()
      } else if (this.typeId === 3) {
        this.parseJudgeRightKey()
      } else if (this.typeId === 4) {
        this.parseFillRightKey()
      } else {
        this.rightKeys = this.rightKey
      }
    },

    parseMultiChoiceRightKey() {
      const c = JSON.parse(this.rightKey)
      let temp = ''
      c.forEach((e) => {
        temp += (e + ' ')
      })
      this.rightKeys = temp
    },

    parseJudgeRightKey() {
      this.rightKeys = this.rightKey === '1' ? '正确' : '错误'
    },

    parseFillRightKey() {
      this.rightKeys = []
      // 填空题（可能有多个答案，且一个空可能有多个答案）
      const c = JSON.parse(this.rightKey)
      for (let i = 0; i < c.length; ++i) {
        if (c[i].indexOf('|') !== -1) {
          this.rightKeys[i] = this.parseMultiFill(c[i])
        } else {
          this.rightKeys[i] = c[i]
        }
      }
      this.initRightKeys = true
    },

    parseMultiFill(fill) {
      let ans = ''
      const fills = fill.split('|')
      fills.forEach((fill) => {
        ans += (fill + ' | ')
      })
      return ans.substring(0, ans.length - 2) + ' [该填空包含多个答案]'
    }
  }
}
</script>
<style scoped>
</style>
