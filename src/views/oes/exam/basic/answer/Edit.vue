<template>
  <el-dialog
    :title="title"
    :width="width"
    top="50px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-form ref="form" :model="answer" :rules="rules" label-position="right" label-width="100px">
      <el-form-item :label="$t('table.answer.answerId')" prop="answerId">
        <el-input v-model="answer.answerId" :readonly="true" />
      </el-form-item>
      <el-form-item :label="$t('table.answer.questionName')" prop="questionName">
        <el-input
          v-model="answer.questionName"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 6}"
          :readonly="true"
        />
      </el-form-item>
      <el-form-item :label="$t('table.answer.rightKey')" prop="rightKey">
        <el-input
          v-model="answer.rightKey"
          :readonly="true"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 6}"
        />
      </el-form-item>
      <el-form-item
        :label="$t('table.answer.answerContent')"
        prop="answerContent"
      >
        <el-input
          v-model="answer.answerContent"
          :readonly="true"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 6}"
        />
      </el-form-item>
      <el-form-item :label="$t('table.answer.score')" prop="score">
        <el-input
          v-model="answer.score"
          :readonly="answer.status === 1"
          maxlength="3"
        >
          <template slot="append">分</template>
        </el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="warning" plain :loading="buttonLoading" @click="isVisible = false">
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
  name: 'CourseEdit',
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
      answer: this.initAnswer(),
      checkParam: [],
      buttonLoading: false,
      screenWidth: 0,
      width: this.initWidth(),
      rules: {
        score: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (!this.answer.answerId) callback()
            if (!isIntegerGreaterThanZero(value)) callback(new Error(this.$t('rules.invalidInteger')))
            callback()
          }, trigger: 'blur'
          },
          { validator: (rule, value, callback) => {
            if (!this.answer.answerId) callback()
            this.checkParam.score = value
            this.$get('exam-basic/paper/type/check', { ...this.checkParam }).then((r) => {
              if (!r.data) {
                callback(this.$t('rules.scoreOverStep'))
              } else {
                callback()
              }
            })
          }, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    },
    isVisible: {
      get() {
        return this.dialogVisible
      },
      set() {
        this.close()
        this.reset()
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
    initAnswer() {
      return {
        answerId: '',
        score: '',
        typeId: '',
        paperId: ''
      }
    },
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
    close() {
      this.$emit('close')
    },
    setAnswer(val) {
      this.answer = { ...val }
      this.checkParam.paperId = this.answer.paperId
      this.checkParam.typeId = this.answer.typeId
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = false
          this.checkParam.status = 1
          this.checkParam.answerId = this.answer.answerId
          this.$put('exam-basic/answer', { ...this.checkParam }).then(() => {
            this.buttonLoading = false
            this.isVisible = false
            this.$message({
              message: this.$t('tips.updateSuccess'),
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
      this.course = this.initAnswer()
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
