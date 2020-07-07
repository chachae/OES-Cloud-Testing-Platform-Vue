<template>
  <div class="warn-view">
    <el-page-header style="padding: 1rem;" :content="score.paperName" :visible.sync="isVisible" @back="goBack" />
    <aside
      style="padding: 1rem;"
    >
      <p>
        各位考生请注意，系统会周期性（3 ~ 6 个月）清除考生的答题数据，请及时查看错题，查漏补缺。
      </p>
    </aside>
    <div class="warn-view">
      <el-row :gutter="10">
        <el-col
          v-for="(warn) in warnAnswers"
          :key="warn.typeId"
          style="padding-bottom: 1rem"
          :xs="24"
          :sm="24"
        >
          <el-card shadow="hover" class="box-card" style="background-color: #eef1f6; padding: 1rem;">
            <div>
              <h3>{{ transQuestionType(warn.typeId) }}</h3>
            </div>
            <el-row :gutter="10">
              <el-col
                v-for="(warnQuestion,questionIndex) in warn.list"
                :key="warnQuestion.questionId"
                :xs="24"
                :sm="24"
              >
                <div class="box-card">
                  <h4>{{ questionIndex + 1 +'：' }} {{ warnQuestion.questionName }}</h4>
                </div>
                <!-- 选择题选项template -->
                <template v-if="isChoice(warn.typeId)">
                  <div v-for="(item,index) in warnQuestion.options" :key="index">
                    <div class="box-card">
                      {{ getChoice(index) }}. {{ item }}
                    </div>
                  </div>
                </template>
                <div class="box-card">
                  <el-link icon="el-icon-warning" type="danger">考生答案：{{ warnQuestion.answerContent }}</el-link>
                </div>
                <div class="box-card">
                  <el-link icon="el-icon-success" type="success">正确答案：{{ warnQuestion.rightKey }}</el-link>
                </div>
                <div class="box-card">
                  <el-link v-if="warnQuestion.analysis!==''" icon="el-icon-circle-plus" type="success">答案解析：{{ warnQuestion.analysis }}</el-link>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import PaperUtil from '@/utils/paper'

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
      question: {}
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
    transQuestionType(typeId) {
      for (const index in this.types) {
        if (this.types[index].typeId === typeId) { return this.types[index].typeName }
      }
    },
    goBack() {
      this.$emit('close')
    },
    isChoice(typeId) {
      return PaperUtil.isChoice(typeId)
    },
    isMultiChoice(typeId) {
      return PaperUtil.isMulChoice(typeId)
    },
    getChoice(index) {
      return PaperUtil.getChoice(index)
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
  .warn-view {
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
      margin: 7px;
      i {
        font-size: .97rem;
      }
      span {
        margin-left: 5px;
      }
    }
  }
</style>
