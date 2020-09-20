<template>
  <div style="margin-bottom: 20px">
    <el-form ref="form" :model="question" :rules="rules" label-position="right" label-width="100px">
      <el-form-item label="选项数量" prop="optionNum">
        <el-input-number
          v-model="optionNum"
          :min="1"
          :max="8"
          label="选项数量"
          @change="checkOptions"
        />
      </el-form-item>
      <el-form-item label="题干" prop="questionName">
        <el-input
          v-model=" question.questionName "
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6}"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      <el-form-item
        v-for="(item,index) in optionNum"
        :key="index"
        :label="`选项 ${choices[index]}`"
        :prop="`optionArray.${index}`"
        :rules="rules.optionArray"
      >
        <el-input
          v-model="question.optionArray[index]"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
      <el-form-item v-if="question.optionArray.length !== 0" label="正确答案" prop="rightKey">
        <el-select
          v-model="question.rightKey"
          :multiple="true"
        >
          <el-option
            v-for="(item,index) in question.optionArray"
            :key="index"
            :label="`选项 ${choices[index]}`"
            :value="choices[index]"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="题目解析" prop="analysis">
        <el-input
          v-model=" question.analysis "
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
  name: 'MulChoice',
  props: {
    courseId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      optionNum: 1,
      choices: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
      question: this.initQuestion(),
      rules: {
        questionName: [{ required: true, message: this.$t('rules.require'), trigger: 'blur' }],
        optionArray: [{ required: true, message: this.$t('rules.require'), trigger: 'blur' }],
        rightKey: [{ required: true, message: this.$t('rules.require'), trigger: 'blur' }]
      }
    }
  },
  methods: {
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.question.options = JSON.stringify(this.question.optionArray)
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
    checkOptions() {
      const oldOption = this.question.optionArray
      if (oldOption.length > this.optionNum) {
        const newOptions = []
        for (let i = 0; i < this.optionNum; i++) {
          newOptions[i] = oldOption[i]
        }
        this.question.optionArray = newOptions
      }
    },

    reset() {
      this.$refs.form.clearValidate()
      this.$refs.form.resetFields()
      this.question = this.initQuestion()
    },

    setQuestion(question) {
      this.question = question
      const options = question.options
      this.$set(this.question, 'optionArray', options)
      this.optionNum = options.length
      if (options instanceof Array) {
        for (let i = 0; i < options.length; i++) {
          this.question.optionArray[i] = options[i]
        }
      }
    },

    initQuestion() {
      return {
        typeId: 2,
        courseId: this.courseId,
        optionArray: [],
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
