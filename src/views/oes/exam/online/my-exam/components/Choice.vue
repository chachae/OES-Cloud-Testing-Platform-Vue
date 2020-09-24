<!-- 单选题模板 -->
<template>
  <div>
    <el-radio-group v-model="question.answerContent" @change="updateChoice(question)">
      <div v-for="(item,index) in optionArray" :key="index">
        <el-radio
          style="margin-bottom: 10px"
          :label="choices[index]"
          size="medium"
        >
          <strong>{{ choices[index] }}. {{ item }}</strong>
        </el-radio>
      </div>
    </el-radio-group>
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
      choices: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
      optionArray: []
    }
  },

  mounted() {
    this.parseOptions()
  },

  methods: {
    parseOptions() {
      this.optionArray = JSON.parse(this.question.options)
    },

    // 实时提交答案
    updateChoice(question) {
      this.$emit('submit', question)
    }
  }
}
</script>

<style scoped />
