<!-- 判断题模板 -->
<template>
  <div>
    <el-radio-group v-model="question.answerContent" @change="updateChoice(question)">
      <el-radio label="1" size="medium" border><strong>正确</strong></el-radio>
      <el-radio label="0" size="medium" border><strong>错误</strong></el-radio>
    </el-radio-group>
  </div>
</template>
<script>
export default {
  name: 'Judge',
  props: {
    question: {
      type: Object,
      required: true
    }
  },

  methods: {

    // 实时提交答案
    updateChoice(question) {
      this.$emit('submit', question)
    }
  }
}
</script>

<style scoped />
