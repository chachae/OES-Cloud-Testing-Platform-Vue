<template>
  <div>
    <el-container ref="examContainer">
      <el-header>
        <div style="display:flex; flex-direction: row;justify-content: space-between">
          <p>
            <strong>考试名称：</strong><el-tag>{{ exam.paperName }}</el-tag>
          </p>
          <p>
            <strong>倒计时：</strong>
            <el-tag type="danger">
              <countdown-date-time
                v-if="exam.startTime && exam.endTime"
                :end-time="exam.endTime"
              />
            </el-tag>
          </p>
        </div>
      </el-header>
      <el-container style="height: 500px; border: 1px solid #eee">
        <el-aside v-if="paperShow" style="background-color: white; border-right: 1px solid #eee" width="22%">
          <el-divider>考试信息</el-divider>
          <div class="view-item">
            <div>
              <p><strong>归属课程：</strong>《 {{ exam.courseName }} 》</p>
            </div>
            <div>
              <p><strong>考试时长：</strong>{{ exam.minute }} 分钟</p>
            </div>
            <div>
              <p><strong>试卷分值：</strong><el-tag type="success">{{ exam.paperScore }} 分</el-tag></p>
            </div>
            <div>
              <p><strong>所在学期：</strong>{{ exam.termName }}</p>
            </div>
          </div>
          <el-divider>答题卡</el-divider>
          <div
            v-for="questions in exam.paperQuestions"
            :key="questions.typeId"
            class="box-card"
          >
            <div slot="header">
              <p><strong>{{ transQuestionType(questions.typeId) }}</strong></p>
            </div>
            <div style="display:flex; flex-direction: row; flex-wrap: wrap; justify-content: flex-start">
              <el-button
                v-for="(question,questionIndex) in questions.list"
                :key="question.questionId"
                :type="calButtonType(question)"
                plain
                style="width: 52px; margin-bottom: 5px; margin-right: 5px; border-radius: 0"
                @click="goAssignBlock(question.questionId)"
              >{{ questionIndex+1 }}</el-button>
            </div>
          </div>
        </el-aside>
        <el-main>
          <div class="view-item" style="margin-bottom: 20px">

            <!-- 考前校验 -->
            <exam-validate
              v-if="checkShow"
              ref="examValidate"
              @validateOk="enterExam"
            />

            <!-- 试卷主体 -->
            <div v-if="paperShow">
              <el-row :gutter="10">
                <el-col :xs="24" :sm="24">
                  <!-- 试卷主体 -->
                  <el-card
                    v-for="questions in exam.paperQuestions"
                    :key="questions.typeId"
                    shadow="never"
                    class="box-card"
                    style="background-color: #f8fafb"
                  >
                    <div slot="header">
                      <h3>{{ transQuestionType(questions.typeId) }} ({{ calTypeScore(questions.typeId) }} 分)</h3>
                    </div>
                    <el-row :gutter="10">
                      <el-col v-for="(question,questionIndex) in questions.list" :key="question.questionId" :xs="24" :sm="24">
                        <div :ref="`question`+question.questionId">
                          <h4>{{ questionIndex + 1 +'、' }} {{ question.questionName }}</h4>
                        </div>
                        <!-- 单项选择题 -->
                        <choice v-if="questions.typeId === 1" :question="question" @submit="updateChoice" />
                        <!-- 多项选择题 -->
                        <mul-choice v-if="questions.typeId === 2" :question="question" @submit="updateChoice" />
                        <!-- 判断题 -->
                        <judge v-if="questions.typeId === 3" :question="question" @submit="updateChoice" />
                        <!-- 填空 -->
                        <fill v-if="questions.typeId === 4" :question="question" @submit="updateChoice" />
                        <!-- 主观题 -->
                        <subjective v-if="questions.typeId === 5" :question="question" @submit="updateChoice" />
                      </el-col>
                    </el-row>
                  </el-card>
                  <el-button v-if="paperShow" type="success" @click="submitExam()">提交试卷</el-button>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import CountdownDateTime from '@/components/CountdownDateTime'
import Judge from './components/Judge'
import Choice from './components/Choice'
import MulChoice from './components/MulChoice'
import Fill from './components/Fill'
import Subjective from './components/Subjective'
import ExamValidate from './Validate'
import { saveLog } from '@/api/exam/basic/violateLog'

export default {
  name: 'ExamDetail',
  components: { Judge, Choice, MulChoice, Fill, Subjective, ExamValidate, CountdownDateTime },
  data() {
    return {
      clientHeight: '',
      queryInfo: {
        username: '',
        fullName: '',
        paperId: ''
      },
      violate: {
        changeTabCount: 0
      },
      answer: {},
      types: {},
      paperType: {},
      exam: {},
      paperShow: false,
      checkShow: true,
      active: 0,
      lastUpdateTime: 0
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    },
    device() {
      return this.$store.state.setting.device
    },
    sidebar() {
      return this.$store.state.setting.sidebar
    }
  },
  watch: {
    clientHeight: function() {
      this.changeFixed(this.clientHeight)
    }
  },
  mounted() {
    this.initQueryInfo()
    this.initValidate()
    this.alertExamTips()
    this.initTypes()
    this.initPaperType()
    this.getExamPaper()
    // 获取浏览器可视区域高度
    this.clientHeight = `${document.documentElement.clientHeight}`
    window.onresize = function temp() {
      this.clientHeight = `${document.documentElement.clientHeight}`
    }
  },

  methods: {
    changeFixed(clientHeight) { // 动态修改样式
      // console.log(clientHeight);
      // console.log(this.$refs.homePage.$el.style.height);
      this.$refs.examContainer.$el.style.height = clientHeight - 20 + 'px'
    },
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    },
    // 试题类型代码转换
    transQuestionType(typeId) {
      for (const index in this.types) {
        if (this.types[index].typeId === typeId) return this.types[index].typeName
      }
      return this.$t('common.unknown')
    },
    initValidate() {
      this.$refs.examValidate.setValidateInfo({ ...this.queryInfo })
    },
    initTypes() {
      this.$get('exam-basic/type/options').then((r) => {
        this.types = r.data.data
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    // 计算试题类型总分
    calTypeScore(typeId) {
      for (const index in this.paperType) {
        if (this.paperType[index].typeId === typeId) {
          return this.paperType[index].num * this.paperType[index].score
        }
      }
    },
    // 获取试题数据
    getExamPaper() {
      this.$get(`exam-online/exam/${this.queryInfo.paperId}`).then((r) => {
        this.exam = r.data.data
      })
    },
    enterExam() {
      this.paperShow = true
      this.checkShow = false
    },
    // 实时提交答案
    updateChoice(question) {
      this.$put('exam-online/answer', { ...question }).then((res) => {
        question.answerId = res.data.data
        // 控制并发
        if (this.banConcurrent()) {
          this.$alert(this.$t('table.exam.concurrent'), this.$t('table.exam.tips'), {
            confirmButtonText: this.$t('common.confirm'),
            type: 'warning'
          })
        }
        this.lastUpdateTime = new Date()
      })
    },
    // 提交试卷
    submitExam() {
      this.$confirm('提交后无法再次修改试卷内容，是否继续？', this.$t('common.tips'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.initQueryInfo()
        this.$post('exam-online/score', { ...this.queryInfo }).then(this.goBack())
      })
    },
    // 试卷类型设置
    initPaperType() {
      this.$get(`exam-basic/paperType/options?paperId=${this.queryInfo.paperId}`).then((r) => {
        this.paperType = { ...r.data.data }
      })
    },
    calButtonType(answer) {
      let c = answer.answerContent
      // 多选，填空多个答案
      if (answer.typeId === 2 || answer.typeId === 4) {
        if (!c) {
          return 'danger'
        } else {
          c = JSON.parse(c)
          return !c || c[0] === '' ? 'danger' : 'success'
        }
      }
      return !c ? 'danger' : 'success'
    },
    // 并发时间间隔控制
    banConcurrent() {
      return this.lastUpdateTime !== 0 && (Date.parse(new Date().toString()) - Date.parse(this.lastUpdateTime)) < 1.5
    },
    // 初始化试卷查询基本信息
    initQueryInfo() {
      const paperId = this.$route.params.paperId
      this.queryInfo.fullName = this.currentUser.fullName
      this.queryInfo.username = this.currentUser.username
      this.queryInfo.paperId = paperId
    },
    // 进入考试弹窗
    alertExamTips() {
      this.$alert(this.$t('table.exam.description'), this.$t('table.exam.tips'), {
        confirmButtonText: this.$t('common.confirm'),
        type: 'warning'
      })
    },
    // 返回考试试卷页面
    goBack() {
      this.active = 0
      this.paperShow = false
      this.checkShow = true
      this.examDetailShow = false
      // this.$emit('close')
    },
    // 答题卡选择滑动
    goAssignBlock(el) {
      const element = this.$refs[`question${el}`][0]
      element.scrollIntoView({ block: 'center', 'behavior': 'smooth' })
    },
    // 作弊行为检查-鼠标移动事件检测（过于暴力）
    violateMouseLeave(e) {
      // 进入考试后才出发
      // if (this.paperShow) {
      //   const className = e.currentTarget
      //   console.log(className)
      //
      //   this.$alert({
      //     title: '警告',
      //     message: `检测到你已离开考试页面，违规记录已累计 ${++this.violate.changeTabCount} 次，超过 3 次后系统将强制提交试卷`,
      //     type: 'warning'
      //   }).catch((r) => {})
      // }
    },
    // 作弊行为检查-切换标签
    violateChangeTab(evt, hidden) {
      // if (this.paperShow) {
      //   if (!hidden) {
      //     // 写入违规行为日志
      //     this.saveViolateLog(501, this.leaveTime)
      //   } else if (this.paperShow) {
      //     // 进入考试后才监听
      //     this.$alert(`检测到你已离开考试页面，违规记录已累计 ${++this.violate.changeTabCount} 次，超过 3 次后系统将强制提交试卷`, this.$t('table.exam.tips'), {
      //       confirmButtonText: this.$t('common.confirm'),
      //       type: 'warning'
      //     }).catch((r) => {
      //     })
      //     // 记录离开时间
      //     this.leaveTime = new Date()
      //   }
      // }
    },
    // 违规行为日志记录
    saveViolateLog(code, violateTime) {
      saveLog(this.queryInfo.paperId, code, violateTime).then((r) => {
      })
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
  .app-container {
    display: inline-block;
    width: 98.6%;
  }
  .header {
    font-weight: 600;
    font-size: 1rem;
    display: inline-flex;
    margin-bottom: 8px;
  }
  .left {
    height: 100%;
  }
  img {
    width: 3.4rem;
    display: inline-block;
  }
  .right {
    margin-left: 10px
  }
</style>
