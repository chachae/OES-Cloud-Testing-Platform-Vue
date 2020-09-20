<template>
  <div style="margin-top: 20px">
    <el-form ref="form" :model="question" :rules="rules" label-position="right" label-width="100px">
      <el-form-item label="题干" prop="questionName">
        <el-input
          v-model="question.questionName"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6}"
          maxlength="200"
          show-word-limit
          @blur="changeQuestionName"
        />
      </el-form-item>
      <el-form-item label="题干预览" prop="questionNamePreview">
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6}"
          maxlength="150"
          show-word-limit
          v-html="questionNamePreview"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain @click="addFill">插入填空</el-button>
      </el-form-item>
      <el-form-item
        v-for="(item,index) in fillNum"
        :key="index"
        :label="`填空 ${fills[index]}`"
        :prop="`fillArray.${index}`"
        :rules="rules.fillArray"
      >
        <el-input
          v-model="question.fillArray[index]"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="题目解析" prop="analysis">
        <el-input
          v-model="question.analysis "
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
  name: 'Choice',
  props: {
    courseId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      fillNum: 0,
      fills: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      question: this.initQuestion(),
      questionNamePreview: '',
      replaceSpaces: '{{#@#}}',
      rules: {
        questionName: [{ required: true, message: this.$t('rules.require'), trigger: 'blur' }],
        fillArray: [{ required: true, message: this.$t('rules.require'), trigger: 'blur' }],
        rightKey: [{ required: true, message: this.$t('rules.require'), trigger: 'blur' }]
      }
    }
  },
  methods: {
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.question.rightKey = JSON.stringify(this.question.fillArray)
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

    addFill() {
      this.question.questionName += this.replaceSpaces
    },

    changeQuestionName() {
      const c = this.question.questionName
      let count = 0
      if (c !== null) {
        this.questionNamePreview = c.replaceAll(this.replaceSpaces, '____')
        for (let i = 0; i < c.length; i++) {
          count += c.charAt(i) === '{' && i + 7 < c.length && c.slice(i, i + 7) === this.replaceSpaces ? 1 : 0
        }
        this.fillNum = count
      }
    },

    setQuestion(question) {
      this.question = question
      const fills = JSON.parse(question.rightKey)
      this.$set(this.question, 'fillArray', fills)
      this.fillNum = fills.length
      this.questionNamePreview = question.questionName
      this.changeQuestionName()
    },

    reset() {
      this.$refs.form.clearValidate()
      this.$refs.form.resetFields()
      this.question = this.initQuestion()
      this.questionNamePreview = ''
    },

    initQuestion() {
      return {
        typeId: 4,
        courseId: this.courseId,
        fillArray: [],
        questionName: '',
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
