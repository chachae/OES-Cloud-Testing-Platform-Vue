<!-- 题目渲染公共组件 -->
<template>
  <div>
    <el-card
      v-for="questions in paperQuestions"
      :key="questions.typeId"
      shadow="never"
      class="box-card"
      style="background-color: #f8fafb;"
    >
      <div slot="header">
        <h3>{{ transQuestionType(questions.typeId) }}&nbsp;<span v-if="paperType.length > 0">({{ calTypeScore(questions.typeId) }} 分)</span></h3>
      </div>
      <el-row :gutter="10">
        <el-col
          v-for="(question,questionIndex) in questions.list"
          :key="question.questionId"
          :xs="24"
          :sm="24"
        >
          <el-divider v-if="questionIndex > 0" />
          <p>
            <strong>
              {{ questionIndex + 1 +' : ' }} {{ parseQuestionName(question) }}
            </strong>
          </p>
          <!-- 选择题选项 -->
          <div v-if="questions.typeId=== 1 || questions.typeId=== 2">
            <div v-for="(item,index) in JSON.parse(question.options)" :key="index">
              <p>
                {{ choices[index] }}. {{ item }}
              </p>
            </div>
          </div>
          <!-- 考生的错误答案 -->
          <warn-answer
            v-if="question.answerContent"
            :warn-answer="question.answerContent"
            :right-key="question.rightKey"
            :type-id="question.typeId"
          />
          <!-- 正确答案组件 -->
          <key-parse
            :right-key="question.rightKey"
            :type-id="questions.typeId"
            :component-type="1"
          />
          <!-- 题目解析 -->
          <analysis :analysis="question.analysis" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { paperTypeOptions } from '@/api/exam/basic/paperType'
import { typeOptions } from '@/api/exam/basic/type'
import KeyParse from './KeyParse'
import Analysis from './Analysis'
import WarnAnswer from './WarnAnswer'
export default {
  name: 'QuestionCard',
  components: { WarnAnswer, KeyParse, Analysis },
  props: {
    paperQuestions: {
      type: Array,
      required: true
    },
    paperId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      replaceSpaces: '{{#@#}}',
      choices: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
      paperType: [],
      types: []
    }
  },
  mounted() {
    this.getTypes()
    this.getPaperType()
  },
  methods: {
    parseQuestionName(question) {
      if (question.typeId === 4) {
        return question.questionName.replaceAll(this.replaceSpaces, '____')
      } else {
        return question.questionName
      }
    },
    getPaperType() {
      if (this.paperId !== null) {
        paperTypeOptions(this.paperId).then((r) => {
          this.paperType = r.data.data
        })
      }
    },
    getTypes() {
      typeOptions().then((r) => {
        this.types = r.data.data
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    calTypeScore(typeId) {
      for (let i = 0; i < this.paperType.length; ++i) {
        if (this.paperType[i].typeId === typeId) {
          return this.paperType[i].num * this.paperType[i].score
        }
      }
    },
    transStatus(status) {
      return status === 1 ? this.$t('common.active') : this.$t('common.inactive')
    },
    transQuestionType(typeId) {
      for (let i = 0; i < this.types.length; ++i) {
        if (this.types[i].typeId === typeId) {
          return this.types[i].typeName
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
