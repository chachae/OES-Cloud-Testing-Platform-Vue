<template>
  <div>
    <el-checkbox-group v-if="initOk" v-model="answerContentArray" @change="updateChoice(question)">
      <div v-for="(item,index) in optionArray" :key="index">
        <div class="box-card">
          <el-checkbox :label="choices[index]" size="medium">{{ choices[index] }}. {{ item }}</el-checkbox>
        </div>
      </div>
    </el-checkbox-group>
  </div>
</template>
<script>
export default {
  name: 'Choice',
  props: {
    question: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      choices: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
      initOk: false,
      answerContentArray: [],
      optionArray: []
    }
  },

  mounted() {
    this.parseAnswerContent()
    this.parseOptions()
    this.initOk = true
  },

  methods: {
    parseOptions() {
      this.optionArray = JSON.parse(this.question.options)
    },

    // 实时提交答案
    updateChoice(question) {
      this.question.answerContent = JSON.stringify(this.answerContentArray.sort())
      this.$emit('submit', question)
    },

    parseAnswerContent() {
      const c = this.question.answerContent
      if (c) {
        this.answerContentArray = JSON.parse(c)
      }
    }
  }
}
</script>

<style scoped />
