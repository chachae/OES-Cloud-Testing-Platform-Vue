<template>
  <div v-if="dialogVisible" class="paper-view">
    <el-page-header
      style="padding: 1rem;"
      :content="paper.paperName"
      @back="goBack"
    />
    <div class="warning custom-block">
      <p class="custom-block-title">WARNING</p>
      <p>
        <strong>注意事项 : </strong>请各位老师或平台管理员，务必对试卷信息进行严格保密，切勿泄露试卷内容！️️
      </p>
    </div>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24">
        <el-card
          shadow="never"
          class="box-card"
          style="background-color: #f8fafb;"
        >
          <div slot="header">
            <h3>试卷信息</h3>
          </div>
          <el-row :gutter="10">
            <el-col :xs="24" :sm="12">
              <p>试卷编号 : {{ paper.paperId }}</p>
            </el-col>
            <el-col :xs="24" :sm="12">
              <p>试卷名称 : {{ paper.paperName }}</p>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :xs="24" :sm="12">
              <p>课程名称 : {{ paper.courseName }}</p>
            </el-col>
            <el-col :xs="24" :sm="12">
              <p>试卷状态 : {{ transStatus(paper.status) }}</p>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :xs="24" :sm="12">
              <p>考试时长 : {{ paper.minute }} 分钟</p>
            </el-col>
            <el-col :xs="24" :sm="12">
              <p>出卷教师 : {{ paper.creatorName }}</p>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :xs="24" :sm="12">
              <p>卷面分值 : {{ paper.paperScore }} 分</p>
            </el-col>
            <el-col :xs="24" :sm="12">
              <p>试卷类型 : {{ transType(paper.type) }}</p>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :xs="24" :sm="12">
              <p>开考时间 : {{ paper.startTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</p>
            </el-col>
            <el-col :xs="24" :sm="12">
              <p>结束时间 : {{ paper.endTime }}</p>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :xs="24" :sm="12">
              <p>创建时间 : {{ paper.createTime }}</p>
            </el-col>
            <el-col :xs="24" :sm="12">
              <p>学期信息 : {{ paper.termName }}</p>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24">
        <!-- 题目卡片显示 -->
        <question-card
          :paper-id="paper.paperId"
          :paper-questions="paper.paperQuestions"
        />
      </el-col>
    </el-row>
    <el-divider />
  </div>
</template>

<script>
import QuestionCard from '../../../common-components/QuestionCard'

export default {
  name: 'PaperView',
  components: { QuestionCard },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      paper: {}
    }
  },
  computed: {
    isPaperViewVisible: {
      get() {
        return this.dialogVisible
      },
      set() {
        this.close()
      }
    }
  },
  methods: {
    setPaper(paper) {
      this.paper = paper
    },
    goBack() {
      this.$emit('close')
    },
    transType(type) {
      return type === 1 ? this.$t('common.paperType.normal') : this.$t('common.paperType.imitate')
    },
    transStatus(status) {
      return status === 1 ? this.$t('common.active') : this.$t('common.inactive')
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
  }
</style>
