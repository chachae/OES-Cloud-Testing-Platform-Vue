<template>
  <div class="paper-view">
    <el-page-header style="padding: 1rem;" :content="paper.paperName" :visible.sync="isVisible" @back="goBack" />
    <div class="warning custom-block">
      <p class="custom-block-title">WARNING</p>
      <p>
        <strong>注意事项</strong>请各位老师或平台管理员，务必对试卷信息进行严格保密，切勿泄露试卷内容！️️
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
              <div class="view-item">
                <i class="el-icon-star-on" /> <span>试卷编号：</span>
                NO.{{ paper.paperId }}
              </div>
            </el-col>
            <el-col :xs="24" :sm="12">
              <div class="view-item">
                <i class="el-icon-star-on" /> <span>试卷名称：</span>
                {{ paper.paperName }}
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :xs="24" :sm="12">
              <div class="view-item">
                <i class="el-icon-star-on" /> <span>课程名称：</span>
                {{ paper.courseName }}
              </div>
            </el-col>
            <el-col :xs="24" :sm="12">
              <div class="view-item">
                <i class="el-icon-star-on" /> <span>开课学院：</span>
                {{ paper.deptName }}
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :xs="24" :sm="12">
              <div class="view-item">
                <i class="el-icon-star-on" /> <span>考试时长：</span>
                {{ paper.minute }} 分钟
              </div>
            </el-col>
            <el-col :xs="24" :sm="12">
              <div class="view-item">
                <i class="el-icon-star-on" /> <span>考试班级：</span>
                <el-tooltip placement="top" :content="paper.deptNames" :enterable="false">
                  <span>{{ paper.deptNames }}</span>
                </el-tooltip>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :xs="24" :sm="12">
              <div class="view-item">
                <i class="el-icon-star-on" /> <span>卷面分值：</span>
                {{ paper.paperScore }} 分
              </div>
            </el-col>
            <el-col :xs="24" :sm="12">
              <div class="view-item">
                <i class="el-icon-star-on" /> <span>试卷类型：</span>
                {{ transType(paper.type) }}
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :xs="24" :sm="12">
              <div class="view-item">
                <i class="el-icon-star-on" /> <span>开考时间：</span>
                {{ paper.startTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
              </div>
            </el-col>
            <el-col :xs="24" :sm="12">
              <div class="view-item">
                <i class="el-icon-star-on" /> <span>结束时间：</span>
                {{ paper.endTime }}
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :xs="24" :sm="12">
              <div class="view-item">
                <i class="el-icon-star-on" /> <span>试卷状态：</span>
                {{ transStatus(paper.status) }}
              </div>
            </el-col>
            <el-col :xs="24" :sm="12">
              <div class="view-item">
                <i class="el-icon-star-on" /> <span>出卷教师：</span>
                {{ paper.creatorName }}
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :xs="24" :sm="12">
              <div class="view-item">
                <i class="el-icon-star-on" /> <span>创建时间：</span>
                {{ paper.createTime }}
              </div>
            </el-col>
            <el-col :xs="24" :sm="12">
              <div class="view-item">
                <i class="el-icon-star-on" /> <span>学期信息：</span>
                {{ paper.termName }}
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24">
        <el-card
          v-for="(questions) in paper.paperQuestions"
          :key="questions.typeId"
          shadow="never"
          class="box-card"
          style="background-color: #f8fafb;"
        >
          <div slot="header">
            <h3>{{ transQuestionType(questions.typeId) }}  ({{ calTypeScore(questions.typeId) }} 分)</h3>
          </div>
          <el-row :gutter="10">
            <el-col
              v-for="(question,questionIndex) in questions.list"
              :key="question.questionId"
              :xs="24"
              :sm="24"
            >
              <div class="view-item">
                <h4>{{ questionIndex + 1 +'：' }} {{ question.questionName }}</h4>
              </div>
              <!-- 选择题选项template -->
              <template v-if="isChoice(questions.typeId)">
                <div v-for="(item,index) in question.options" :key="index">
                  <div class="view-item">
                    {{ getChoice(index) }}. {{ item }}
                  </div>
                </div>
              </template>
              <div class="view-item">
                正确答案：{{ question.rightKey }}
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    <el-divider />
  </div>
</template>

<script>
import PaperUtil from '@/utils/paper'

export default {
  name: 'PaperView',
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
        if (this.types[index].typeId === typeId) { return this.types[index].typeName }
      }
    },
    isChoice(typeId) {
      return PaperUtil.isChoice(typeId)
    },
    isMultiChoice(typeId) {
      return PaperUtil.isMulChoice(typeId)
    },
    getChoice(index) {
      return PaperUtil.getChoice(index)
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
