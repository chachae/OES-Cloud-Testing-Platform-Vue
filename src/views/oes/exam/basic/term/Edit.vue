<template>
  <el-dialog
    :title="title"
    :width="width"
    top="50px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-form ref="form" :model="term" :rules="rules" label-position="right" label-width="100px">
      <el-form-item v-show="term.termId !== ''" :label="$t('table.term.termId')" prop="termId">
        <el-input v-model="term.termId" :readonly="true" />
      </el-form-item>
      <el-form-item :label="$t('table.term.termName')" prop="termName">
        <el-input v-model="term.termName" :readonly="term.termId === '' ? false : 'readonly'" />
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

export default {
  name: 'TermEdit',
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
      term: this.initTerm(),
      buttonLoading: false,
      screenWidth: 0,
      width: this.initWidth(),
      rules: {
        termName: [
          { required: true, message: this.$t('rules.require'), trigger: 'change' },
          { min: 2, max: 20, message: this.$t('rules.range2to20'), trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (!this.term.termId) {
              this.$get('exam-basic/term/check', { termName: value }).then((r) => {
                if (!r.data) {
                  callback(this.$t('rules.termNameExist'))
                } else {
                  callback()
                }
              })
            } else {
              callback()
            }
          }, trigger: 'change' }
        ]
      }
    }
  },
  computed: {
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
  methods: {
    initTerm() {
      return {
        termId: '',
        termName: ''
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
    setTerm(val) {
      this.term = { ...val }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = false
          if (!this.term.termId) {
            // create
            this.$post('exam-basic/term', { ...this.term }).then(() => {
              this.buttonLoading = false
              this.isVisible = false
              this.$message({
                message: this.$t('tips.createSuccess'),
                type: 'success'
              })
              this.$emit('success')
            })
          } else {
            // update
            this.term.createTime = this.term.updateTime = null
            this.$put('exam-basic/term', { ...this.term }).then(() => {
              this.buttonLoading = false
              this.isVisible = false
              this.$message({
                message: this.$t('tips.updateSuccess'),
                type: 'success'
              })
              this.$emit('success')
            })
          }
        } else {
          return false
        }
      })
    },
    reset() {
      // 先清除校验，再清除表单，不然有奇怪的bug
      this.$refs.form.clearValidate()
      this.$refs.form.resetFields()
      this.term = this.initTerm()
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
