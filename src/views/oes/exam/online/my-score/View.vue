<template>
  <div class="paper-view">
    <el-page-header style="padding: 1rem;" :content="score.paperName" :visible.sync="isVisible" @back="goBack" />
    <div class="warning custom-block">
      <p class="custom-block-title">WARNING</p>
      <p><strong>注意事项 : </strong>系统会周期性（3 ~ 6 个月）清除考生的答题数据，请及时查看错题，查漏补缺。</p>
    </div>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24">
        <!-- 题目卡片显示 -->
        <div v-if="warnAnswers.length === 0" class="tip custom-block">
          <p class="custom-block-title">TIP</p>
          <p><strong>提示 : </strong>暂无错题信息</p>
        </div>
        <question-card
          v-else
          :paper-questions="warnAnswers"
          :paper-id="paperId"
        />
      </el-col>
    </el-row>
  </div>
</template>
<script>
import QuestionCard from '../../common-components/QuestionCard'
export default {
  name: 'WarnAnswerView',
  components: { QuestionCard },
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
      paperId: null,
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
  methods: {
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
      if (val !== undefined) {
        this.warnAnswers = val
      } else {
        this.warnAnswers = []
      }
    },
    setPaperId(paperId) {
      this.paperId = paperId
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
