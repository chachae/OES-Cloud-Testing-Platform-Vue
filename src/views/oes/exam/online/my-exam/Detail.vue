<template>
  <div>
    <el-container ref="examContainer">
      <el-header>
        <div style="display:flex; flex-direction: row;justify-content: space-between">
          <p>
            <strong>考试名称：</strong><el-tag>{{ parsePaperName(exam.paperName) }}</el-tag>
          </p>
          <p v-if="exam.isStart && exam.startTime && exam.endTime">
            <strong>距离考试结束还有：</strong>
            <el-tag type="danger">
              <countdown-date-time
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
            <div>
              <el-button
                v-for="(question,questionIndex) in questions.list"
                :key="question.questionId"
                :type="calButtonType(question)"
                plain
                round
                style="margin-bottom: 5px; margin-right: 5px"
                @click="goAssignBlock(question.questionId)"
              >{{ questionIndex+1 }}</el-button>
            </div>
          </div>
        </el-aside>
        <el-main>
          <div class="view-item" style="margin-bottom: 20px">

            <!-- 考前信息校验 -->
            <validate-info
              v-if="validateInfo"
              ref="validateInfo"
              @validateOk="initValidateDevice"
            />

            <!-- 考前设备校验 -->
            <validate-device
              v-show="validateDevice"
              ref="validateDevice"
              @validateOk="enterExam"
            />

            <!--            <div-->
            <!--              v-visibility-change="violateChangeTab"-->
            <!--              @mouseleave="violateMouseLeave($event)"-->
            <!--              @contextmenu.prevent-->
            <!--              @select.prevent-->
            <!--            >-->

            <div
              v-if="paperShow"
            >
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
                          <h4>{{ questionIndex + 1 +' : ' }} {{ question.questionName }}</h4>
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
import Judge from './question-components/Judge'
import Choice from './question-components/Choice'
import MulChoice from './question-components/MulChoice'
import Fill from './question-components/Fill'
import Subjective from './question-components/Subjective'
import CountdownDateTime from '@/components/CountdownDateTime'
import ValidateInfo from './detail-components/ValidateInfo'
import ValidateDevice from './detail-components/ValidateDevice'
import { saveLog } from '@/api/exam/basic/violateLog'
import { typeOptions } from '@/api/exam/basic/type'
import { saveAnswer } from '@/api/exam/online/answer'
import { paperTypeOptions } from '@/api/exam/basic/paperType'
export default {
  name: 'ExamDetail',
  components: { Judge, Choice, MulChoice, Fill, Subjective, ValidateDevice, ValidateInfo, CountdownDateTime },
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
      validateInfo: true,
      validateDevice: false,
      active: 0,
      lastUpdateTime: 0,
      leaveTime: null
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    }
  },
  watch: {
    clientHeight(oldVal, newVal) {
      this.changeFixed(oldVal)
    }
  },
  mounted() {
    // body 添加鼠标移动时间
    // this.initMouseEvent()
    // 初始化查询数据
    this.initQueryInfo()
    // 初始化考试信息校验组件
    this.initValidateInfo()
    // 初始化考试信息校验组件
    // this.initValidate()
    // 初始化试题类型数据
    // this.initTypes()
    // 初始化试卷试题类型数据
    // this.initPaperType()
    // 获取浏览器可视区域高度
    this.clientHeight = document.documentElement.clientHeight
    window.onresize = () => {
      return (() => {
        this.clientHeight = this.initHeight()
      })()
    }
  },

  methods: {
    initHeight() {
      return document.documentElement.clientHeight
    },
    changeFixed(clientHeight) { // 动态修改样式
      this.$refs.examContainer.$el.style.height = clientHeight - 20 + 'px'
    },
    // 试题类型代码转换
    transQuestionType(typeId) {
      for (const index in this.types) {
        if (this.types[index].typeId === typeId) return this.types[index].typeName
      }
      return this.$t('common.unknown')
    },
    // 初始化考前设备校验
    initValidateDevice(exam) {
      this.exam = exam
      // 初始化试题类型数据
      this.initTypes()
      // 初始化试卷试题类型数据
      this.initPaperType()
      this.validateInfo = false
      this.validateDevice = true
      this.$refs.validateDevice.fetchValidate({ ...this.queryInfo })
    },
    // 初始化考前信息校验
    initValidateInfo() {
      this.$refs.validateInfo.fetchValidate({ ...this.queryInfo })
    },
    initTypes() {
      typeOptions().then((r) => {
        this.types = r.data.data
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
    parsePaperName(paperName) {
      return !paperName ? '获取试卷信息失败' : paperName
    },
    // 关闭当前页面
    closeCurrentPage() {
      setTimeout(() => {
        this.$router.push('dashboard')
      }, 1000)
    },
    enterExam() {
      this.paperShow = true
      this.validateDevice = false
    },
    // 实时提交答案
    updateChoice(question) {
      question.paperId = this.queryInfo.paperId
      saveAnswer(question).then((res) => {
        question.answerId = res.data.data
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
      this.initQueryInfo()
      this.$post('exam-online/score', { ...this.queryInfo })
      // this.$confirm('提交后无法再次修改试卷内容，是否继续？', this.$t('common.tips'), {
      //   confirmButtonText: this.$t('common.confirm'),
      //   cancelButtonText: this.$t('common.cancel'),
      //   type: 'warning'
      // }).then(() => {
      //   this.initQueryInfo()
      //   this.$post('exam-online/score', { ...this.queryInfo }).then(this.goBack())
      // })
    },
    // 试卷类型设置
    initPaperType() {
      paperTypeOptions(this.queryInfo.paperId).then((r) => {
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
          return !c || !c[0] || c[0] === '' ? 'danger' : 'success'
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
    // 答题卡选择滑动
    goAssignBlock(el) {
      const element = this.$refs[`question${el}`][0]
      element.scrollIntoView({ block: 'center', 'behavior': 'smooth' })
    },
    // 作弊行为检查-鼠标移动事件检测（过于暴力）
    violateMouseLeave(e) {
      // 进入考试后才出发
      if (this.paperShow) {
        const className = e.currentTarget
        console.log(className)
        this.$alert({
          title: '警告',
          message: `检测到你已离开考试页面，违规记录已累计 ${++this.violate.changeTabCount} 次，超过 3 次后系统将强制提交试卷`,
          type: 'warning'
        }).catch((r) => {})
      }
    },
    // 作弊行为检查-切换标签
    violateChangeTab(evt, hidden) {
      if (this.paperShow) {
        if (!hidden) {
          // 写入违规行为日志
          // this.saveViolateLog(501, this.leaveTime)
        } else if (this.paperShow) {
          // 进入考试后才监听
          this.$alert(`检测到你已离开考试页面，违规记录已累计 ${++this.violate.changeTabCount} 次，超过 3 次后系统将强制提交试卷`, this.$t('table.exam.tips'), {
            confirmButtonText: this.$t('common.confirm'),
            type: 'warning'
          }).catch((r) => {
          })
          // 记录离开时间
          this.leaveTime = new Date()
        }
      }
    },
    // 违规行为日志记录
    saveViolateLog(code, violateTime) {
      saveLog(this.queryInfo.paperId, code, violateTime).then((r) => {
      })
    }
    // 初始化鼠标离开浏览器事件（过于暴力）
    // initMouseEvent() {
    //   document.body.addEventListener('mouseleave', this.violateMouseLeave, false)
    // }
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
