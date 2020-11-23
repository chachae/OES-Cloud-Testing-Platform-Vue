<!-- 填空题模板 -->
<template>
  <div v-if="initOk">
    <el-input
      v-for="(item,index) in question.fillCount"
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
      this.parseAnswerContent()
    },
    // 处理学生回答的问题
    parseAnswerContent() {
      if (this.question.answerContent) {
        this.answerContentArray = JSON.parse(this.question.answerContent)
      } else {
        for (let i = 0; i < this.question.fillCount; i++) {
          this.answerContentArray.push('')
        }
      }
    }
  }
}
</script>

<style scoped />
