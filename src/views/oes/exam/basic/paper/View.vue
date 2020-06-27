<template>
  <div class="paper-view">
    <el-page-header style="padding: 1rem;" :content="paper.paperName" :visible.sync="isVisible" @back="goBack" />
    <el-alert
      style="padding: 1rem;"
      title="请各位老师或试卷管理员，保管好试卷信息，切勿泄露试卷信息！️️"
      type="warning"
      show-icon
      :closable="false"
    />
    <el-row :gutter="10" style="">
      <el-col :xs="24" :sm="12">
        <div class="paper-view">
          <h3>{{ $t('common.baseData') }}</h3>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-star-on" /> <span>{{ $t('table.paper.paperId') +'：' }}</span>
          {{ paper.paperId }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-star-on" /> <span>{{ $t('table.paper.paperName') +'：' }}</span>
          {{ paper.paperName }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-star-on" /> <span>{{ $t('table.paper.courseName') +'：' }}</span>
          {{ paper.courseName }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-star-on" /> <span>{{ $t('table.paper.deptName') +'：' }}</span>
          {{ paper.deptName }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-star-on" /> <span>{{ $t('table.paper.minute') +'：' }}</span>
          {{ paper.minute }} 分钟
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-star-on" /> <span>{{ $t('table.paper.deptNames') +'：' }}</span>
          <el-tooltip placement="top" :content="paper.deptNames" :enterable="false">
            <span>{{ paper.deptNames | ellipsis }}</span>
          </el-tooltip>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-star-on" /> <span>{{ $t('table.paper.paperScore') +'：' }}</span>
          {{ paper.paperScore }} 分
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-star-on" /> <span>{{ $t('table.paper.type') +'：' }}</span>
          {{ transType(paper.type) }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-star-on" /> <span>{{ $t('table.paper.startTime') +'：' }}</span>
          {{ paper.startTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-star-on" /> <span>{{ $t('table.paper.endTime') +'：' }}</span>
          {{ paper.endTime }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-star-on" /> <span>{{ $t('table.paper.status') +'：' }}</span>
          {{ transStatus(paper.status) }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-star-on" /> <span>{{ $t('table.paper.creatorName') +'：' }}</span>
          {{ paper.creatorName }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-star-on" /> <span>{{ $t('table.paper.createTime') +'：' }}</span>
          {{ paper.createTime }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-star-on" /> <span>{{ $t('table.paper.termName') +'：' }}</span>
          {{ paper.termName }}
        </div>
      </el-col>
    </el-row>
    <el-divider />

    <aside>
      <el-row :gutter="10">
        <el-col :xs="24" :sm="12">
          <div class="view-item">
            <h3>{{ $t('common.questionData') }}</h3>
          </div>
        </el-col>
      </el-row>
      <el-row v-for="(questions) in paper.paperQuestions" :key="questions.typeId" :gutter="10">
        <el-col :xs="24" :sm="24">
          <div class="view-item">
            <h3>{{ transQuestionType(questions.typeId) }}  ({{ calTypeScore(questions.typeId) }} 分)</h3>
          </div>
        </el-col>
        <el-row :gutter="10">
          <el-col v-for="(question,questionIndex) in questions.list" :key="question.questionId" :xs="24" :sm="24">
            <div class="view-item">
              <h4>{{ questionIndex + 1 +'：' }} {{ question.questionName }}</h4>
            </div>
            <!-- 选择题选项template -->
            <template v-if="isChoice(questions.typeId)">
              <div class="view-item">
                A. {{ question.optionA }}
              </div>
              <div class="view-item">
                B. {{ question.optionB }}
              </div>
              <div class="view-item">
                C. {{ question.optionC }}
              </div>
              <div class="view-item">
                D. {{ question.optionD }}
              </div>
              <div v-if="isMultiChoice() && this.question.optionE !== ''" class="view-item">
                E. {{ question.optionE }}
              </div>
              <div v-if="isMultiChoice() && this.question.optionF !== ''" class="view-item">
                F. {{ question.optionF }}
              </div>
            </template>
            <div class="view-item">
              {{ $t('table.question.rightKey') }} : {{ question.rightKey }}
            </div>
          </el-col>
        </el-row>
      </el-row>
    </aside>
  </div>
</template>

<script>
export default {
  name: 'PaperView',
  filters: {
    ellipsis(value) {
      if (!value) return '暂未指派班级'
      if (value.length > 20) {
        return value.slice(0, 20) + '......'
      }
      return value
    }
  },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      screenWidth: 0,
      width: this.initWidth(),
      types: {},
      paperType: {},
      paper: []
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
    setPaper(val) {
      this.paper = { ...val }
    },
    setTypes(val) {
      this.types = { ...val }
    },
    initPaperType(val) {
      this.paperType = { ...val }
    },
    goBack() {
      this.$emit('close')
    },
    transType(type) {
      return type === 1 ? this.$t('common.paperType.normal') : this.$t('common.paperType.imitate')
    },
    calTypeScore(typeId) {
      for (const index in this.paperType) {
        if (this.paperType[index].typeId === typeId) { return this.paperType[index].num * this.paperType[index].score }
      }
    },
    transStatus(status) {
      return status === 1 ? this.$t('common.active') : this.$t('common.inactive')
    },
    transQuestionType(typeId) {
      for (const index in this.types) {
        if (this.types[index].typeId === typeId) return this.types[index].typeName
      }
      return this.$t('common.unknown')
    },
    isChoice(typeId) {
      return typeId === 1 || typeId === 2
    },
    isMultiChoice(typeId) {
      return typeId === 2
    },
    checkAnalysis(analysis) {
      return analysis === null ? this.$t('common.noAnalysis') : analysis
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
      margin: 7px;
      i {
        font-size: .120rem;
        color: #E6A23C;
      }
      span {
        margin-left: 5px;
      }
    }
  }
</style>
