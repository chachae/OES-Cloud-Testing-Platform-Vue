<template>
  <div class="paper-view">
    <el-page-header style="padding: 1rem;" :content="score.paperName" :visible.sync="isVisible" @back="goBack" />
    <div class="warning custom-block">
      <p class="custom-block-title">WARNING</p>
      <p><strong>注意事项：</strong>系统会周期性（3 ~ 6 个月）清除考生的答题数据，请及时查看错题，查漏补缺。</p>
    </div>
    <el-row :gutter="10">
      <el-col
        v-for="(warn) in warnAnswers"
        :key="warn.typeId"
        :xs="24"
        :sm="24"
      >
        <el-card
          shadow="never"
          class="box-card"
          style="background-color: #f8fafb; margin-bottom: 1rem"
        >
          <div slot="header">
            <h3>{{ transQuestionType(warn.typeId) }}</h3>
          </div>
          <el-row :gutter="10">
            <el-col
              v-for="(warnQuestion,questionIndex) in warn.list"
              :key="warnQuestion.questionId"
              :xs="24"
              :sm="24"
            >
              <div class="view-item">
                <h4>{{ questionIndex + 1 +'：' }} {{ parseQuestionName(warnQuestion) }}</h4>
              </div>
              <!-- 选择题选项template -->
              <template v-if="warn.typeId === 1 || warn.typeId === 2">
                <div v-for="(item,index) in JSON.parse(warnQuestion.options)" :key="index">
                  <div class="view-item">
                    {{ choices[index] }}. {{ item }}
                  </div>
                </div>
              </template>
              <div class="view-item">
                <el-link type="danger" :underline="false">考生答案：</el-link>
                <el-link :underline="false">{{ warnQuestion.answerContent }}</el-link>
              </div>
              <div class="view-item">
                <el-link type="primary" :underline="false">正确答案：</el-link>
                <el-link :underline="false">{{ warnQuestion.rightKey }}</el-link>
              </div>
              <div v-if="warnQuestion.analysis" class="view-item">
                <el-link type="primary" :underline="false">答案解析：</el-link>
                <el-link :underline="false">{{ warnQuestion.analysis }}</el-link>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  name: 'WarnAnswerView',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      screenWidth: 0,
      warnAnswers: [],
      types: {},
      score: {},
      width: this.initWidth(),
      question: {},
      choices: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
      replaceSpaces: '{{#@#}}'
    }
  },
  computed: {
    isVisible: {
      get() {
        return this.dialogVisible
      },
      set() {
        this.close()
      }
    }
  },
  mounted() {
    window.onresize = () => {
      return (() => {
        this.width = this.initWidth()
      })()
    }
  },
  methods: {
    initWidth() {
      this.screenWidth = document.body.clientWidth
      if (this.screenWidth < 550) {
        return '95%'
      } else if (this.screenWidth < 990) {
        return '580px'
      } else if (this.screenWidth < 1400) {
        return '600px'
      } else {
        return '650px'
      }
    },
    parseQuestionName(question) {
      return question.typeId === 4 ? question.questionName.replaceAll(this.replaceSpaces, '____') : question.questionName
    },
    transQuestionType(typeId) {
      for (const index in this.types) {
        if (this.types[index].typeId === typeId) { return this.types[index].typeName }
      }
    },
    goBack() {
      this.$emit('close')
    },
    close() {
      this.$emit('close')
    },
    setWarnAnswers(val) {
      this.warnAnswers = { ...val }
    },
    setScore(val) {
      this.score = { ...val }
    },
    setTypes(val) {
      this.types = { ...val }
    }
  }
}
</script>
<style lang="scss" scoped>
  .paper-view {
    .img-wrapper {
      text-align: center;
      margin-top: -1.5rem;
      margin-bottom: 10px;
      img {
        width: 4rem;
        border-radius: 50%;
      }
    }
    .view-item {
      margin: 12px;
      i {
        font-size: .97rem;
      }
      span {
        margin-left: 5px;
      }
    }
  }
</style>
