<template>
  <el-dialog
    :title="title"
    :width="width"
    top="50px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isRandomVisible"
  >
    <el-form ref="form" :model="paper" :rules="rules" label-position="right" label-width="100px">
      <el-form-item :label="$t('table.paper.paperName')" prop="paperName">
        <el-input v-model="paper.paperName" />
      </el-form-item>
      <el-form-item :label="$t('table.question.courseName')" prop="courseId">
        <el-select
          v-model="paper.courseId"
          style="width:100%"
        >
          <el-option
            v-for="item in courses"
            :key="item.courseId"
            :label="item.courseName"
            :value="item.courseId"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('table.question.typeName')" prop="typeIds">
        <el-select
          v-model="paper.typeIds"
          multiple
          style="width:100%"
          @change="sortTypeId"
        >
          <el-option
            v-for="item in types"
            :key="item.typeId"
            :label="item.typeName"
            :value="item.typeId"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('table.paper.nums')" prop="nums">
        <el-input v-model="paper.nums" placeholder="请输入题目数量分布，使用英文逗号隔开" />
      </el-form-item>
      <el-form-item :label="$t('table.paper.scores')" prop="scores">
        <el-input v-model="paper.scores" placeholder="请输入题目分值分布，使用英文逗号隔开" />
      </el-form-item>
      <el-form-item :label="$t('table.paper.paperScore')">
        <el-input v-model="calPaperScore" :readonly="true">
          <template slot="append">分</template>
        </el-input>
      </el-form-item>
      <el-form-item :label="$t('table.question.difficult')" prop="difficult">
        <el-select
          v-model="paper.difficult"
          style="width:100%"
        >
          <el-option value="0" :label="$t('common.question.avg')" />
          <el-option value="1" :label="$t('common.question.easy')" />
          <el-option value="2" :label="$t('common.question.medium')" />
          <el-option value="3" :label="$t('common.question.hard')" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('table.paper.type')" prop="type">
        <el-select
          v-model="paper.type"
          style="width:100%"
        >
          <el-option value="1" :label="$t('common.paperType.normal')" />
          <el-option value="0" :label="$t('common.paperType.imitate')" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('table.paper.startTime')" prop="startTime">
        <el-date-picker
          v-model="paper.startTime"
          type="datetime"
          :placeholder="$t('table.paper.startTime')"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="$t('table.paper.endTime')" prop="endTime">
        <el-date-picker
          v-model="paper.endTime"
          type="datetime"
          :placeholder="$t('table.paper.endTime')"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item :label="$t('table.paper.minute')">
        <el-input v-model="calMinute" :readonly="true">
          <template slot="append">分钟</template>
        </el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="warning" plain :loading="buttonLoading" @click="isRandomVisible = false">
        {{ $t('common.cancel') }}
      </el-button>
      <el-button type="primary" plain :loading="buttonLoading" @click="submitForm">
        {{ $t('common.confirm') }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>

import { isIntegerGreaterThanZero } from '@/utils/my-validate'

export default {
  name: 'RandomPaper',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      initFlag: false,
      courses: [],
      types: [],
      buttonLoading: false,
      screenWidth: 0,
      width: this.initWidth(),
      paper: this.initPaper(),
      rules: {
        paperName: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        courseId: { required: true, message: this.$t('rules.require'), trigger: 'change' },
        typeId: { required: true, message: this.$t('rules.require'), trigger: 'change' },
        difficult: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        type: { required: true, message: this.$t('rules.require'), trigger: 'change' },
        nums: [
          { required: true, message: this.$t('rules.require'), trigger: 'change' },
          { validator: (rule, value, callback) => {
            if (!value) {
              callback()
            }
            const values = value.split(',')
            if (this.paper.typeIds.length !== values.length) {
              callback(new Error(this.$t('rules.invalidNum')))
            } else {
              values.forEach((r) => {
                if (!isIntegerGreaterThanZero(r)) callback(new Error(this.$t('rules.invalidInteger')))
              })
              callback()
            }
          }, trigger: 'blur'
          }
        ],
        scores: [
          { required: true, message: this.$t('rules.require'), trigger: 'change' },
          { validator: (rule, value, callback) => {
            if (!value) {
              callback()
            }
            const values = value.split(',')
            if (this.paper.typeIds.length !== values.length) {
              callback(new Error(this.$t('rules.invalidNum')))
            } else {
              values.forEach((r) => {
                if (!isIntegerGreaterThanZero(r)) callback(new Error(this.$t('rules.invalidInteger')))
              })
              callback()
            }
          }, trigger: 'blur'
          }
        ],
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
          }],
        questionName: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { min: 3, max: 100, message: this.$t('rules.range3to100'), trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    },
    isRandomVisible: {
      get() {
        return this.dialogVisible
      },
      set() {
        this.close()
        this.reset()
      }
    },
    calMinute() {
      if (!this.paper.startTime || !this.paper.endTime) return '0'
      const start = new Date(this.paper.startTime)
      const end = new Date(this.paper.endTime)
      return ((end.getHours() - start.getHours()) * 60 + (end.getMinutes() - start.getMinutes()))
    },
    calPaperScore() {
      const scores = this.paper.scores.split(',')
      const nums = this.paper.nums.split(',')
      if (!scores || !nums) return '0'
      if (scores.length !== nums.length) return '0'
      let sum = 0
      scores.forEach((item, index) => {
        sum += item * nums[index]
      })
      return sum
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
      if (this.screenWidth < 991) {
        return '90%'
      } else if (this.screenWidth < 1400) {
        return '45%'
      } else {
        return '800px'
      }
    },
    sortTypeId() {
      this.paper.typeIds.sort()
    },
    close() {
      this.$emit('close')
    },
    setCourses(val) {
      this.courses = { ...val }
    },
    setTypes(val) {
      this.types = { ...val }
    },
    initPaper() {
      return {
        paperName: '',
        courseId: '',
        typeIds: [],
        difficult: '0',
        type: '',
        startTime: '',
        endTime: '',
        nums: '',
        scores: '',
        minute: '',
        creatorId: ''
      }
    },
    isFutureTime(time) {
      return new Date(time).getTime() > new Date().getTime()
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = false
          this.paper.minute = this.calMinute
          this.paper.paperScore = this.calPaperScore
          this.paper.creatorId = this.currentUser.userId
          this.$post('examination/paper/random', { ...this.paper }).then(() => {
            // this.buttonLoading = false
            this.isRandomVisible = false
            this.$message({
              message: this.$t('tips.createSuccess'),
              type: 'success'
            })
            this.$emit('success')
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
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
