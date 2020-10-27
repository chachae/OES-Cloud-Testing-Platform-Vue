<template>
  <div>
    <el-form ref="form" :model="paper" :rules="rules" label-position="right" label-width="100px">
      <el-divider content-position="left">基础信息</el-divider>
      <el-row :gutter="10">
        <el-col :xs="24" :sm="8">
          <el-form-item :label="$t('table.paper.paperName')" prop="paperName">
            <el-input v-model="paper.paperName" maxlength="30" show-word-limit />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item :label="$t('table.question.courseName')" prop="courseId">
            <el-select v-model="paper.courseId" style="width: 100%">
              <el-option
                v-for="item in courses"
                :key="item.courseId"
                :label="item.courseName"
                :value="item.courseId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item :label="$t('table.term.termName')" prop="termId">
            <el-select v-model="paper.termId" style="width: 100%">
              <el-option
                v-for="item in terms"
                :key="item.termId"
                :label="item.termName"
                :value="item.termId"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :xs="24" :sm="8">
          <el-form-item :label="$t('table.question.difficult')" prop="difficult">
            <el-select v-model="paper.difficult" style="width: 100%">
              <el-option value="0" :label="$t('common.question.avg')" />
              <el-option value="1" :label="$t('common.question.easy')" />
              <el-option value="2" :label="$t('common.question.medium')" />
              <el-option value="3" :label="$t('common.question.hard')" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item :label="$t('table.paper.type')" prop="type">
            <el-select
              v-model="paper.type"
              style="width:100%"
            >
              <el-option value="1" :label="$t('common.paperType.normal')" />
              <el-option value="0" :label="$t('common.paperType.imitate')" />
            </el-select>
          </el-form-item>
        </el-col>
        <!-- 题型分布 -->
        <el-col :xs="24" :sm="8">
          <el-form-item label="题型分布" prop="typeIds">
            <el-select
              v-model="paper.typeIds"
              multiple
              style="width:100%"
              @change="sortAndCheck"
            >
              <el-option
                v-for="item in types"
                :key="item.typeId"
                :label="item.typeName"
                :value="item.typeId"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 动态题目类型信息框 -->
      <question-info
        :type-ids="paper.typeIds"
        :types="types"
        :paper-types="paperTypes"
      />
      <el-divider content-position="left">时间信息</el-divider>
      <el-row :gutter="10">
        <el-col :xs="24" :sm="8">
          <el-form-item :label="$t('table.paper.startTime')" prop="startTime">
            <el-date-picker
              v-model="paper.startTime"
              type="datetime"
              :placeholder="$t('table.paper.startTime')"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item :label="$t('table.paper.endTime')" prop="endTime">
            <el-date-picker
              v-model="paper.endTime"
              type="datetime"
              :placeholder="$t('table.paper.endTime')"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-divider content-position="left">数据汇总</el-divider>
      <el-row :gutter="10">
        <el-col :xs="24" :sm="8">
          <el-form-item label="卷面分值">
            <el-input v-model="score" :readonly="true">
              <template slot="append">分</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item label="考试时长">
            <el-input v-model="calMinute" :readonly="true">
              <template slot="append">分钟</template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" plain :loading="buttonLoading" @click="submitForm">
        {{ $t('common.confirm') }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { random } from '@/api/exam/basic/paper'
import QuestionInfo from './QuestionInfo'
export default {
  name: 'RandomPaper',
  components: { QuestionInfo },
  props: {
    terms: {
      type: Array,
      required: true
    },
    courses: {
      type: Array,
      required: true
    },
    types: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      initFlag: false,
      buttonLoading: false,
      paper: this.initPaper(),
      paperTypes: [],
      score: 0,
      rules: {
        typeIds: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        paperName: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        termId: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        courseId: { required: true, message: this.$t('rules.require'), trigger: 'change' },
        typeId: { required: true, message: this.$t('rules.require'), trigger: 'change' },
        difficult: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        type: { required: true, message: this.$t('rules.require'), trigger: 'change' },
        startTime: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (!value) {
              callback()
            } else if (!this.isFutureTime(value)) {
              callback(new Error(this.$t('rules.invalidFutureTime')))
            } else {
              callback()
            }
          }, trigger: 'blur'
          }
        ],
        endTime: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (!value) {
              callback()
            } else if (!this.isFutureTime(value)) {
              callback(new Error(this.$t('rules.invalidFutureTime')))
            } else if (new Date(this.paper.startTime).getTime() >= new Date(value).getTime()) {
              callback(new Error(this.$t('rules.invalidEndTime')))
            } else if (new Date(this.paper.startTime).getDay() !== new Date(value).getDay()) {
              callback(new Error(this.$t('rules.invalidSameDay')))
            } else {
              callback()
            }
          }, trigger: 'blur'
          }]
      }
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    },
    calMinute() {
      if (!this.paper.startTime || !this.paper.endTime) return '0'
      const start = new Date(this.paper.startTime)
      const end = new Date(this.paper.endTime)
      return ((end.getHours() - start.getHours()) * 60 + (end.getMinutes() - start.getMinutes()))
    }
  },
  watch: {
    types(newVal, oldVal) {
      this.initPaperType()
    },
    paperTypes: {
      handler(newVal, oldVal) {
        this.calScore()
      },
      deep: true
    }
  },
  methods: {
    sortAndCheck() {
      this.paper.typeIds.sort()
    },
    initPaper() {
      return {
        paperName: '',
        courseId: '',
        difficult: '',
        type: '',
        startTime: '',
        endTime: '',
        typeIds: [],
        nums: [],
        scores: [],
        minute: '',
        creatorId: '',
        termId: ''
      }
    },
    calScore() {
      this.score = 0
      for (let i = 0; i < this.paperTypes.length; i++) {
        this.score += (this.paperTypes[i].score * this.paperTypes[i].num)
      }
    },
    isFutureTime(time) {
      return new Date(time).getTime() > new Date().getTime()
    },
    calTypeIdIndex(typeId) {
      for (let i = 0; i < this.types.length; i++) {
        if (typeId === this.types[i].typeId) {
          return i
        }
      }
    },
    initPaperType() {
      for (let i = 0; i < this.types.length; i++) {
        // 便于测试，实际：const obj = { 'score': 0, 'num': 0 }
        const obj = { 'score': i + 1, 'num': i + 1 }
        this.$set(this.paperTypes, i, obj)
      }
    },
    calTypeName(typeId) {
      for (let i = 0; i < this.types.length; i++) {
        if (typeId === this.types[i].typeId) {
          return this.types[i].typeName
        }
      }
    },
    updateNumsAndScores() {
      const len = this.paper.typeIds.length
      this.paper.scores = new Array(len)
      this.paper.nums = new Array(len)
      for (let i = 0; i < len; i++) {
        const typeIdIndex = this.calTypeIdIndex(this.paper.typeIds[i])
        this.paper.scores[i] = this.paperTypes[typeIdIndex].score
        this.paper.nums[i] = this.paperTypes[typeIdIndex].num
      }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.updateNumsAndScores()
          this.paper.minute = this.calMinute
          this.paper.paperScore = this.score
          random(this.paper).then(() => {
            this.$message({
              message: this.$t('tips.createSuccess'),
              type: 'success'
            })
            this.$emit('success')
            this.reset()
          })
        } else {
          return false
        }
      })
    },
    reset() {
      // 先清除校验，再清除表单，不然有奇怪的bug
      this.$refs.form.clearValidate()
      this.$refs.form.resetFields()
      this.paperTypes = []
    }
  }
}
</script>

<style scoped>

</style>
