<!-- 填空题模板 -->
<template>
  <div v-if="initOk">
    <el-input
      v-for="(item,index) in fillNum"
      :key="index"
      v-model="answerContentArray[index]"
      :maxlength="20"
      :clearable="true"
      class="filter-container"
      @change="updateChoice(question)"
      @paste.native.capture.prevent=""
      @copy.native.capture.prevent=""
    >
      <template slot="prepend">填空 {{ index + 1 }}</template>
    </el-input>
  </div>
</template>
<script>
export default {
  name: 'Fill',
  props: {
    question: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      initOk: false,
      replaceSpaces: '{{#@#}}',
      fillNum: 0,
      answerContentArray: []
    }
  },

  mounted() {
    this.dealQuestion()
    this.initOk = true
  },

  methods: {
    // 实时提交答案
    updateChoice(question) {
      this.question.answerContent = JSON.stringify(this.answerContentArray)
      this.$emit('submit', question)
    },
    // 处理选择题
    dealQuestion() {
      this.calFillNum()
      this.question.questionName = this.question.questionName.replaceAll(this.replaceSpaces, '____')
      this.parseAnswerContent()
    },
    // 处理学生回答的问题
    parseAnswerContent() {
      if (this.question.answerContent) {
        this.answerContentArray = JSON.parse(this.question.answerContent)
      }
    },
    // 计算填空数量
    calFillNum() {
      const c = this.question.questionName
      let count = 0
      if (c !== null) {
        for (let i = 0; i < c.length; i++) {
          count += c.charAt(i) === '{' && i + 7 <= c.length && c.slice(i, i + 7) === this.replaceSpaces ? 1 : 0
        }
        this.fillNum = count
      }
      for (let i = 0; i < count; i++) {
        this.answerContentArray[i] = ''
      }
    }
  }
}
</script>

<style scoped />
