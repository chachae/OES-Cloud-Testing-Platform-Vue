<template>
  <div
    v-visibility-change="violateChangeTab"
    @mouseleave="violateMouseLeave($event)"
    @contextmenu.prevent
    @select.prevent
  >
    <div class="view-item" :visible.sync="isDetailShow" style="margin-bottom: 20px">
      <el-page-header style="padding: 1rem;" :content="exam.paperName" :visible.sync="isDetailShow" @back="goBack" />
      <div class="warning custom-block">
        <p class="custom-block-title">WARNING</p>
        <p><strong>{{ $t('table.exam.tips') }}：</strong>距离本场考试截止还有：{{ day }}天{{ hr }}:{{ min }}:{{ sec }}</p>
      </div>
      <div v-if="checkShow" style="margin-top: 10px; margin-bottom: 20px" class="view-item">
        <el-steps direction="vertical" style="height: 300px" :active="active" finish-status="success">
          <el-step
            title="步骤 1"
            description="点击「考试承诺书」阅读承若书后完成第一步任务"
          />
          <el-step
            title="步骤 2"
            description="点击「检测设备」进行考前设备检测"
          />
          <el-step
            title="步骤 3"
            description="点击「活体人脸卡证匹配」进行考生身份核验，如果浏览器提示本站需使用摄像头，请选择「允许」后继续下一步"
          />
        </el-steps>
      </div>
      <div v-if="checkShow" class="view-item">
        <el-button class="filter-item" type="primary" plain @click="edit(dialog.isRead)">考试承诺书</el-button>
        <el-button class="filter-item" :disabled="active === 0 || active >= 2" type="primary" plain @click="deviceCheck">检测设备</el-button>
        <el-button class="filter-item" :disabled="active === 0 || active === 1 || active === 3" type="primary" plain @click="tracking">活体人脸卡证匹配</el-button>
        <el-button v-if="active === 3" class="filter-item" type="success" plain @click="getExamPaper">进入考试</el-button>
      </div>
      <div v-if="paperShow">
        <el-row :gutter="10">
          <el-col :xs="24" :sm="5">
            <!-- 题目选择器（答题卡） -->
            <el-card
              v-for="questions in paperQuestionMap"
              :key="questions.typeId"
              shadow="never"
              class="box-card"
              style="background-color: #f8fafb;"
            >
              <div slot="header">
                <span>{{ transQuestionType(questions.typeId) }}</span>
              </div>
              <div style="display:flex; flex-direction: row; flex-wrap: wrap; justify-content: flex-start">
                <el-button
                  v-for="(question,questionIndex) in questions.list"
                  :key="question.questionId"
                  :type="calButtonType(question.answerContent)"
                  plain
                  style="width: 52px; margin-bottom: 5px; margin-right: 5px; border-radius: 0"
                  @click="goAssignBlock(question.questionId)"
                >{{ questionIndex+1 }}</el-button>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="19">
            <!-- 试卷主体 -->
            <el-card
              v-for="questions in paperQuestionMap"
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
                    <h4>{{ questionIndex + 1 +'：' }} {{ question.questionName }}</h4>
                  </div>
                  <!-- 判断template -->
                  <template v-if="isCheck(questions.typeId)">
                    <el-radio-group v-model="question.answerContent" @change="updateChoice(question)">
                      <el-radio label="1" size="medium">正确</el-radio>
                      <el-radio label="0" size="medium">错误</el-radio>
                    </el-radio-group>
                  </template>
                  <!-- 单项选择题选项template -->
                  <template v-if="isChoice(questions.typeId)">
                    <el-radio-group v-model="question.answerContent" @change="updateChoice(question)">
                      <div v-for="(item,index) in question.options" :key="index">
                        <el-radio style="margin-bottom: 10px" :label="choices[index]" size="medium">{{ choices[index] }}. {{ item }}</el-radio>
                      </div>
                    </el-radio-group>
                  </template>
                  <!-- 多项选择题选项template -->
                  <template v-if="isMultiChoice(questions.typeId)">
                    <el-checkbox-group v-model="question.answerContent" @change="updateChoice(question)">
                      <div v-for="(item,index) in question.options" :key="index">
                        <div class="box-card">
                          <el-checkbox :label="choices[index]" size="medium">{{ choices[index] }}. {{ item }}</el-checkbox>
                        </div>
                      </div>
                    </el-checkbox-group>
                  </template>
                  <template v-if="!isChoice(questions.typeId) && !isMultiChoice(questions.typeId) && !isCheck(questions.typeId)">
                    <el-input
                      v-model="question.answerContent"
                      type="textarea"
                      :autosize="{ minRows: 1, maxRows: 6}"
                      :maxlength="400"
                      :clearable="true"
                      @change="updateChoice(question)"
                      @paste.native.capture.prevent=""
                      @copy.native.capture.prevent=""
                    />
                  </template>
                </el-col>
              </el-row>
            </el-card>
            <el-button v-show="paperShow" type="success" @click="submitExam()">提交试卷</el-button>
          </el-col>
        </el-row>
      </div>
      <pledge
        ref="pledge"
        :dialog-visible="dialog.isVisible"
        :title="dialog.title"
        @isRead="editIsRead"
        @close="editClose"
      />
      <Tracking
        ref="tracking"
        :dialog-visible="dialog.isTrackingVisible"
        :type="dialog.type"
        @close="trackingClose"
        @success="trackingSuccess"
      />
    </div>
  </div>
</template>

<script>
import Pledge from './Pledge'
import Tracking from '@/components/Tracking'
import { checkWebcam } from '@/utils/camera'
export default {
  name: 'ExamDetail',
  components: { Pledge, Tracking },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      choices: ['A', 'B', 'C', 'D', 'E', 'F'],
      dialog: {
        type: '',
        isTrackingVisible: false,
        isVisible: false,
        title: '',
        isRead: false
      },
      queryInfo: {
        studentId: '',
        paperId: ''
      },
      updateInfo: {
        studentId: '',
        paperId: '',
        questionId: '',
        answerContent: ''
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
      paperQuestionMap: null,
      active: 0,
      day: 0, // 天
      hr: 0, // 时
      min: 0, // 分
      sec: 0, // 秒,
      lastUpdateTime: 0
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    },
    isDetailShow: {
      get() {
        return this.dialogVisible
      },
      set() {
        this.close()
      }
    }
  },
  mounted() {
    this.countdown()
  },
  methods: {
    // 是否单选题
    isChoice(typeId) {
      return typeId === 1
    },
    // 是否多选题
    isMultiChoice(typeId) {
      return typeId === 2
    },
    // 是否为判断题
    isCheck(typeId) {
      return typeId === 3
    },
    // 试题类型代码转换
    transQuestionType(typeId) {
      for (const index in this.types) {
        if (this.types[index].typeId === typeId) return this.types[index].typeName
      }
      return this.$t('common.unknown')
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
      this.$get(`exam-online/exam/${this.queryInfo.paperId}`, { studentId: this.currentUser.userId }).then((r) => {
        const paper = r.data.data
        this.paperQuestionMap = paper.paperQuestions
        this.paperQuestionMap.forEach((pq) => {
          // 对多选题的答案进行数组转换
          if (pq.typeId === 2) {
            pq.list.forEach((obj) => {
              if (!obj.answerContent) obj.answerContent = []
              else obj.answerContent = obj.answerContent.split(',')
            })
          }
        })
      })
      this.paperShow = true
      this.checkShow = false
    },
    // 考试倒计时
    countdown() {
      const end = Date.parse(new Date(this.exam.endTime).toString())
      const now = Date.parse(new Date().toString())
      const msec = end - now
      const day = parseInt(msec / 1000 / 60 / 60 / 24)
      const hr = parseInt(msec / 1000 / 60 / 60 % 24)
      const min = parseInt(msec / 1000 / 60 % 60)
      const sec = parseInt(msec / 1000 % 60)
      this.day = day
      this.hr = hr > 9 ? hr : '0' + hr
      this.min = min > 9 ? min : '0' + min
      this.sec = sec > 9 ? sec : '0' + sec
      const that = this
      setTimeout(function() {
        that.countdown()
      }, 1000)
    },
    // 实时提交答案
    updateChoice(question) {
      this.setUpdateInfo(question)
      this.$put('exam-online/answer', { ...this.updateInfo }).then((res) => {
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
    // 关闭 Visible
    editClose() {
      this.dialog.isVisible = false
    },
    // 考试承诺书已读处理
    editIsRead() {
      this.dialog.isRead = true
      this.active = 1
    },
    // 考试承诺书弹窗
    edit(isRead) {
      this.$refs.pledge.setRead(isRead)
      this.dialog.title = this.$t('table.exam.pledgeTips')
      this.dialog.isVisible = true
    },
    // 试题更新信息设置
    setUpdateInfo(question) {
      this.updateInfo.typeId = question.typeId
      this.updateInfo.answerId = question.answerId
      this.updateInfo.answerContent = question.answerContent
      this.updateInfo.questionId = question.questionId
    },
    // 题目类型设置
    setTypes(val) {
      this.types = { ...val }
    },
    // 试卷类型设置
    initPaperType(val) {
      this.paperType = { ...val }
    },
    // 试卷信息设置
    setExam(row) {
      this.exam = { ...row }
      this.initQueryInfo()
      this.initUpdateInfo()
    },
    calButtonType(answerContent) {
      return (answerContent === null || answerContent === '') ? 'danger' : 'success'
    },
    // 并发时间间隔控制
    banConcurrent() {
      return this.lastUpdateTime !== 0 && (Date.parse(new Date().toString()) - Date.parse(this.lastUpdateTime)) < 1.5
    },
    // 初始化试卷查询基本信息
    initQueryInfo() {
      this.queryInfo.studentId = this.currentUser.userId
      this.queryInfo.paperId = this.exam.paperId
    },
    // 初始化试题答案更新基本信息
    initUpdateInfo() {
      this.updateInfo.studentId = this.currentUser.userId
      this.updateInfo.paperId = this.exam.paperId
    },
    // 关闭人脸匹配
    trackingClose() {
      this.dialog.isTrackingVisible = false
    },
    // 人脸匹配成功处理
    trackingSuccess() {
      this.active = 3
      this.dialog.isTrackingVisible = false
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
      this.dialog.isRead = false
      this.$emit('close')
    },
    // 检测平台监控设备
    deviceCheck() {
      if (!this.dialog.isRead) {
        this.$message({
          message: this.$t('tips.noPledgeSelected'),
          type: 'warning'
        })
      } else {
        if (!checkWebcam()) {
          this.$message({
            message: '系统摄像头不可用',
            type: 'error'
          })
        } else {
          this.$message({
            message: '摄像头检测通过',
            type: 'success'
          })
          this.active = 2
        }
      }
    },
    // 打开人脸匹配模态框
    tracking() {
      if (!this.dialog.isRead) {
        this.$message({
          message: this.$t('tips.noPledgeSelected'),
          type: 'warning'
        }).catch((r) => {})
      } else {
        this.dialog.type = 'tracking'
        this.$refs.tracking.resetTracking()
        this.dialog.isTrackingVisible = true
      }
    },
    // 答题卡选择滑动
    goAssignBlock(el) {
      const element = this.$refs[`question${el}`][0]
      console.log(element)
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
      if (hidden === false) {
        console.log('回到当前页了！')
      } else if (this.paperShow) {
        // // 进入考试后才监听
        // this.$alert(`检测到你已离开考试页面，违规记录已累计 ${++this.violate.changeTabCount} 次，超过 3 次后系统将强制提交试卷`, this.$t('table.exam.tips'), {
        //   confirmButtonText: this.$t('common.confirm'),
        //   type: 'warning'
        // }).catch((r) => {})
      }
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
