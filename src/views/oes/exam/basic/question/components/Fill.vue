<template>
  <div style="margin-top: 20px">
    <div class="tip custom-block" style="margin: 0 0 1.2rem 0">
      <p>
        填空题录入约定：
      </p>
      <blockquote>
        <p>
          <i>
            一、请使用系统提供的填空插入按钮为填空题插入填空，系统会根据插入点自动生成对应数量的填空答案输入栏<br>
            二、若希望一个填空内可拥有多个答案，可使用"|"隔开，如"Java|java|JAVA"，系统将视作该填空包含三个答案<br>
            三、答案内勿含"|"符号，若包含则系统会视其为一空多答案
          </i>
        </p>
      </blockquote>
      <p>
        请遵循如上所示的提示进行填空题录入，保证题目正确性
      </p>
    </div>
    <el-form ref="form" :model="question" :rules="rules" label-position="right" label-width="100px">
      <el-form-item label="题干" prop="questionName">
        <el-input
          ref="questionName"
          v-model="question.questionName"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6}"
          maxlength="200"
          show-word-limit
          :readonly="question.questionId !== ''"
          @blur="changeQuestionName"
        />
      </el-form-item>
      <el-form-item v-if="questionNamePreview" label="题干预览" prop="questionNamePreview">
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6}"
          maxlength="150"
          show-word-limit
          v-html="questionNamePreview"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" plain @click="addFill">光标处插入填空</el-button>
      </el-form-item>
      <el-form-item
        v-for="(item,index) in question.fillCount"
        :key="index"
        :inline="true"
        :label="`填空 ${fills[index]}`"
        :prop="`fillArray.${index}`"
        :rules="rules.fillArray"
      >
        <div class="filter-container">
          <el-input
            v-model="question.fillArray[index]"
            class="filter-item"
            maxlength="100"
            style="width: 80%"
          />
          <el-button v-if="question.questionId === ''" class="filter-item" type="danger" plain @click="removeFill(index)">移除当前填空</el-button>
        </div>
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
import { saveQuestion, updateQuestion } from '@/api/exam/basic/question'

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
          this.question.createTime = this.question.updateTime = null
          this.question.rightKey = JSON.stringify(this.question.fillArray)
          if (this.question.questionId) {
            updateQuestion(this.question).then((r) => {
              this.$message({
                message: this.$t('tips.createSuccess'),
                type: 'success'
              })
              this.reset()
            })
          } else {
            saveQuestion(this.question).then((r) => {
              this.$message({
                message: this.$t('tips.updateSuccess'),
                type: 'success'
              })
              this.reset()
            })
          }
        }
      })
    },

    addFill() {
      this.insertText(this.replaceSpaces)
    },

    insertText(insertTxt) {
      // 获取el-input中的input元素
      const elInput = this.$refs.questionName.$el.firstElementChild
      // 获取el-input的值
      const txt = elInput.value
      // 做插入前做长度校验
      if (txt.length + insertTxt.length >= 200) {
        return
      }
      // 获取选区开始位置
      const startPos = elInput.selectionStart
      // 获取选区结束位置
      const endPos = elInput.selectionEnd
      if (startPos === undefined || endPos === undefined) return
      // 将文本插入光标位置
      this.question.questionName = txt.substring(0, startPos) + insertTxt + txt.substring(endPos)
      // 将光标移至文本末尾
      elInput.focus()
      elInput.selectionStart = startPos + insertTxt.length
      elInput.selectionEnd = startPos + insertTxt.length
    },

    removeFill(index) {
      this.calFillArray(index)
      const c = this.question.questionName
      let count = -1
      let idx = -1
      c.replace(/{{#@#}}/g, function(m, i) {
        ++count
        if (index === count) {
          idx = i
        }
      })
      this.question.questionName = c.substring(0, idx) + c.substring(idx + 7)
      this.changeQuestionName()
    },

    calFillArray(index) {
      if (index === this.question.fillCount - 1) {
        this.question.fillArray.pop()
      } else {
        this.question.fillArray.splice(index, 1)
      }
    },

    changeQuestionName() {
      if (this.question.questionId === '') {
        const c = this.question.questionName
        if (c !== null) {
          let count = 0
          this.questionNamePreview = c.replace(/{{#@#}}/g, '____')
          c.replace(/{{#@#}}/g, function(m, i) {
            ++count
          })
          this.question.fillCount = count
        }
      }
    },

    setQuestion(question) {
      this.question = question
      const fills = JSON.parse(question.rightKey)
      this.$set(this.question, 'fillArray', fills)
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
        questionId: '',
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
