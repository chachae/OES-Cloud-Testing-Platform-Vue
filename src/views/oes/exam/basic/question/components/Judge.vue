<template>
  <div style="margin-bottom: 20px">
    <el-form ref="form" :model="question" :rules="rules" label-position="right" label-width="100px">
      <el-form-item label="题干" prop="questionName">
        <el-input
          v-model=" question.questionName "
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6}"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="正确答案" prop="rightKey">
        <el-select v-model="question.rightKey">
          <el-option
            v-for="(item) in judges"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="题目解析" prop="analysis">
        <el-input
          v-model="question.analysis"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 6}"
          maxlength="250"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="难度" prop="difficult">
        <el-rate
          v-model="question.difficult"
          :max="3"
          :show-text="false"
          :show-score="false"
          style="margin-top: 10px"
        />
      </el-form-item>
    </el-form>
    <el-button @click="submitForm">提交</el-button>
  </div>
</template>

<script>
import { saveQuestion } from '@/api/exam/basic/question'
export default {
  name: 'Judge',
  props: {
    courseId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      optionNum: 1,
      judges: [{ value: '1', label: '正确' }, { value: '0', label: '错误' }],
      question: this.initQuestion(),
      rules: {
        questionName: [{ required: true, message: this.$t('rules.require'), trigger: 'blur' }],
        rightKey: [{ required: true, message: this.$t('rules.require'), trigger: 'blur' }]
      }
    }
  },

  methods: {
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          saveQuestion(this.question).then((r) => {
            this.$message({
              message: this.$t('tips.createSuccess'),
              type: 'success'
            })
            this.reset()
          })
        }
      })
    },

    setQuestion(question) {
      this.question = question
    },

    reset() {
      this.$refs.form.clearValidate()
      this.$refs.form.resetFields()
      this.question = this.initQuestion()
    },

    initQuestion() {
      return {
        typeId: 3,
        courseId: this.courseId,
        options: null,
        rightKey: null,
        analysis: null,
        difficult: 1
      }
    }
  }
}
</script>

<style scoped>

</style>
