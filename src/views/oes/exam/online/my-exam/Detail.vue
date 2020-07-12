<template>
  <div>
    <div class="view-item" :visible.sync="isDetailShow">
      <el-page-header style="padding: 1rem;" :content="exam.paperName" :visible.sync="isDetailShow" @back="goBack" />
      <div class="warning custom-block">
        <p class="custom-block-title">WARNING</p>
        <p><strong>{{ $t('table.exam.tips') }}：</strong>{{ $t('table.exam.description') }}</p>
        <p>距离本场考试截止还有：{{ day }}天{{ hr }}:{{ min }}:{{ sec }}</p>
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
            description="点击「活体人脸卡证匹配」进行考生身份核验"
          />
        </el-steps>
      </div>
      <div v-if="checkShow" class="view-item">
        <el-button class="filter-item" type="primary" plain @click="edit(dialog.isRead)">考试承诺书</el-button>
        <el-button class="filter-item" :disabled="active >= 2" type="primary" plain @click="next">检测设备</el-button>
        <el-button class="filter-item" :disabled="active === 3" type="primary" plain @click="tracking">活体人脸卡证匹配</el-button>
        <el-button v-if="active === 3" class="filter-item" type="success" plain @click="getExamPaper()">进入考试</el-button>
      </div>
      <div v-show="paperShow" class="view-item">
        <el-row :gutter="10">
          <el-col v-for="questions in paperQuestion" :key="questions.typeId" style="padding-bottom: 1rem" :xs="24" :sm="24">
            <el-card shadow="hover" class="box-card" style="background-color: #eef1f6; padding: 1rem;">
              <el-col :xs="24" :sm="24">
                <div>
                  <h3>{{ transQuestionType(questions.typeId) }} ({{ calTypeScore(questions.typeId) }} 分)</h3>
                </div>
              </el-col>
              <el-row :gutter="10">
                <el-col v-for="(question,questionIndex) in questions.list" :key="question.questionId" :xs="24" :sm="24">
                  <div>
                    <h4>{{ questionIndex + 1 +'：' }} {{ question.questionName }}</h4>
                  </div>
                  <!-- 判断template -->
                  <template v-if="isCheck(questions.typeId)">
                    <el-radio-group v-model="question.answerContent" @change="updateChoice(question)">
                      <el-radio label="1">正确</el-radio>
                      <el-radio label="0">错误</el-radio>
                    </el-radio-group>
                  </template>
                  <!-- 单项选择题选项template -->
                  <template v-if="isChoice(questions.typeId)">
                    <el-radio-group v-model="question.answerContent" @change="updateChoice(question)">
                      <div v-for="(item,index) in question.options" :key="index">
                        <div class="box-card">
                          <el-radio :label="choices[index]">{{ choices[index] }}. {{ item }}</el-radio>
                        </div>
                      </div>
                    </el-radio-group>
                  </template>
                  <!-- 多项选择题选项template -->
                  <template v-if="isMultiChoice(questions.typeId)">
                    <el-checkbox-group v-model="question.answerContent" @change="updateChoice(question)">
                      <div v-for="(item,index) in question.options" :key="index">
                        <div class="box-card">
                          <el-checkbox :label="choices[index]">{{ choices[index] }}. {{ item }}</el-checkbox>
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
                    />
                  </template>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>
        <div class="filter-container">
          <el-button v-show="paperShow" type="success" @click="submitExam()">提交</el-button>
        </div>
        <el-divider />
      </div>
      <pledge
        ref="pledge"
        :dialog-visible="dialog.isVisible"
        :title="dialog.title"
        @isRead="editIsRead"
        @close="editClose"
      />
    </div>
    <Tracking
      ref="tracking"
      :dialog-visible="dialog.isTrackingVisible"
      :type="dialog.type"
      @close="trackingClose"
      @success="trackingSuccess"
    />
  </div>
</template>

<script>
import Pledge from './Pledge'
import Tracking from './Tracking'
import { checkCamera } from '@/utils/camera'
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
      answer: {},
      types: {},
      paperType: {},
      exam: {},
      paperShow: false,
      checkShow: true,
      paperQuestion: null,
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
    isChoice(typeId) {
      return typeId === 1
    },
    isMultiChoice(typeId) {
      return typeId === 2
    },
    isCheck(typeId) {
      return typeId === 3
    },
    transQuestionType(typeId) {
      for (const index in this.types) {
        if (this.types[index].typeId === typeId) return this.types[index].typeName
      }
      return this.$t('common.unknown')
    },
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
        this.paperQuestion = r.data.data
        this.paperQuestion.forEach((pq) => {
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
    // 倒计时
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
      this._interval = setTimeout(function() {
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
    submitExam() {
      this.initQueryInfo()
      this.$post('exam-online/score', { ...this.queryInfo }).then(this.goBack())
    },
    editClose() {
      this.dialog.isVisible = false
    },
    editIsRead() {
      this.dialog.isRead = true
      this.active = 1
    },
    edit(isRead) {
      this.$refs.pledge.setRead(isRead)
      this.dialog.title = this.$t('table.exam.pledgeTips')
      this.dialog.isVisible = true
    },
    setUpdateInfo(question) {
      this.updateInfo.typeId = question.typeId
      this.updateInfo.answerId = question.answerId
      this.updateInfo.answerContent = question.answerContent
      this.updateInfo.questionId = question.questionId
    },
    setTypes(val) {
      this.types = { ...val }
    },
    initPaperType(val) {
      this.paperType = { ...val }
    },
    setExam(row) {
      this.exam = { ...row }
      this.initQueryInfo()
      this.initUpdateInfo()
    },
    banConcurrent() {
      return this.lastUpdateTime !== 0 && (Date.parse(new Date().toString()) - Date.parse(this.lastUpdateTime)) < 1.5
    },
    initQueryInfo() {
      this.queryInfo.studentId = this.currentUser.userId
      this.queryInfo.paperId = this.exam.paperId
    },
    initUpdateInfo() {
      this.updateInfo.studentId = this.currentUser.userId
      this.updateInfo.paperId = this.exam.paperId
    },
    trackingClose() {
      this.dialog.isTrackingVisible = false
    },
    trackingSuccess() {
      this.active = 3
      this.dialog.isTrackingVisible = false
    },
    alertExamTips() {
      this.$alert(this.$t('table.exam.description'), this.$t('table.exam.tips'), {
        confirmButtonText: this.$t('common.confirm'),
        type: 'warning'
      })
    },
    goBack() {
      this.active = 0
      this.paperShow = false
      this.checkShow = true
      this.examDetailShow = false
      this.dialog.isRead = false
      this.$emit('close')
    },
    next() {
      if (!this.dialog.isRead) {
        this.$message({
          message: this.$t('tips.noPledgeSelected'),
          type: 'warning'
        })
      } else {
        if (!checkCamera()) {
          this.$message({
            message: '系统摄像头不可用',
            type: 'error'
          })
        } else {
          this.active = 2
        }
      }
    },
    tracking() {
      if (!this.dialog.isRead) {
        this.$message({
          message: this.$t('tips.noPledgeSelected'),
          type: 'warning'
        })
      } else {
        this.dialog.type = 'tracking'
        this.dialog.isTrackingVisible = true
        this.$refs.tracking.initTracking()
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
