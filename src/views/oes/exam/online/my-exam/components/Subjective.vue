<template>
  <div>
    <el-input
      v-model="question.answerContent"
      type="textarea"
      :maxlength="400"
      :clearable="true"
      class="filter-container"
      @change="updateChoice(question)"
      @paste.native.capture.prevent=""
      @copy.native.capture.prevent=""
    />
  </div>
</template>
<script>
export default {
  name: 'Subjective',
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
