<template>
  <div class="paper-view" :visible.sync="isDetailShow">
    <el-page-header style="padding: 1rem;" :content="exam.paperName" :visible.sync="isDetailShow" @back="goBack" />
    <aside>
      <p>
        {{ $t('table.exam.tips') }}：{{ $t('table.exam.description') }}
      </p>
      <p>
        距离本场考试截止还有：{{ day }}天{{ hr }}:{{ min }}:{{ sec }}
      </p>
    </aside>
    <div v-if="checkShow" style="height: 200px" class="paper-view">
      <el-steps direction="vertical" :active="active" finish-status="success">
        <el-step
          :title="$t('table.exam.step1')"
          :description="$t('table.exam.readPledge')"
        />
        <el-step
          :title="$t('table.exam.step2')"
          :description="$t('table.exam.checkDevice')"
        />
      </el-steps>
    </div>
    <div v-if="checkShow" class="paper-view">
      <el-button class="filter-item" type="primary" plain @click="edit(dialog.isRead)">考试承诺书</el-button>
      <el-button class="filter-item" type="primary" plain @click="next">检测设备</el-button>
      <el-button v-if="active === 2" class="filter-item" type="success" plain @click="getExamPaper()">进入考试
      </el-button>
    </div>
    <div v-show="paperShow" class="paper-view">
      <el-row :gutter="10">
        <el-col v-for="questions in paperQuestion" :key="questions.typeId" style="padding-bottom: 1rem" :xs="24" :sm="24">
          <el-card class="box-card" style="background-color: #eef1f6; padding: 1rem;">
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
                    <div class="box-card">
                      <el-radio label="A">A. {{ question.optionA }}</el-radio>
                    </div>
                    <div class="box-card">
                      <el-radio label="B">B. {{ question.optionB }}</el-radio>
                    </div>
                    <div class="box-card">
                      <el-radio label="C">C. {{ question.optionC }}</el-radio>
                    </div>
                    <div class="box-card">
                      <el-radio label="D">D. {{ question.optionD }}</el-radio>
                    </div>
                  </el-radio-group>
                </template>
                <!-- 多项选择题选项template -->
                <template v-if="isMultiChoice(questions.typeId)">
                  <el-checkbox-group v-model="question.answerContent" @change="updateChoice(question)">
                    <div class="box-card">
                      <el-checkbox label="A">A. {{ question.optionA }}</el-checkbox>
                    </div>
                    <div class="box-card">
                      <el-checkbox label="B">B. {{ question.optionB }}</el-checkbox>
                    </div>
                    <div class="box-card">
                      <el-checkbox label="C">C. {{ question.optionC }}</el-checkbox>
                    </div>
                    <div class="box-card">
                      <el-checkbox label="D">D. {{ question.optionD }}</el-checkbox>
                    </div>
                    <div v-if="isMultiChoice() && this.question.optionE !== ''">
                      <div class="box-card">
                        <el-checkbox label="E">E. {{ question.optionE }}</el-checkbox>
                      </div>
                    </div>
                    <div v-if="isMultiChoice() && this.question.optionF !== ''">
                      <div class="box-card">
                        <el-checkbox label="F">F. {{ question.optionF }}</el-checkbox>
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
</template>

<script>
import Pledge from './Pledge'

export default {
  name: 'ExamDetail',
  components: { Pledge },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialog: {
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
      this.queryInfo.studentId = this.currentUser.userId
      this.$get('exam-online/exam/one', { ...this.queryInfo }).then((r) => {
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
        if (this.active++ > 2) this.active = 2
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
  .box-card {
    margin-bottom: 10px;
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
