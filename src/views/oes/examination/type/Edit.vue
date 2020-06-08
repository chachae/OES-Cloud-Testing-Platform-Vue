<template>
  <el-dialog
    :title="title"
    :width="width"
    top="50px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-form ref="form" :model="type" :rules="rules" label-position="right" label-width="100px">
      <el-form-item v-show="type.typeId !== ''" :label="$t('table.type.typeId')" prop="typeId">
        <el-input v-model="type.typeId" :readonly="true" />
      </el-form-item>
      <el-form-item
        :label="$t('table.type.typeName')"
        prop="typeName"
      >
        <el-input v-model="type.typeName" :readonly="type.typeId.toString().length === 0 ? false : 'readonly'" />
      </el-form-item>
      <el-form-item
        :label="$t('table.type.score')"
        prop="score"
      >
        <el-input v-model="type.score" />
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
  name: 'TypeEdit',
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
      type: this.initType(),
      buttonLoading: false,
      screenWidth: 0,
      width: this.initWidth(),
      rules: {
        typeName: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { min: 2, max: 10, message: this.$t('rules.range2to10'), trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (!this.type.typeId) {
              this.$get(`examination/type/check/${value}`).then((r) => {
                if (!r.data) {
                  callback(this.$t('rules.typeNameExist'))
                } else {
                  callback()
                }
              })
            } else {
              callback()
            }
          }, trigger: 'blur' }
        ],
        score: [
          { validator: (rule, value, callback) => {
            if (value === null || value === '') {
              callback()
            } else if (!isIntegerGreaterThanZero(value)) {
              callback(new Error(this.$t('rules.invalidInteger')))
            } else if (value.toString().length > 3) {
              callback(new Error(this.$t('rules.noMoreThan3')))
            } else {
              callback()
            }
          }, trigger: 'blur' }
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
  mounted() {
    window.onresize = () => {
      return (() => {
        this.width = this.initWidth()
      })()
    }
  },
  methods: {
    initType() {
      return {
        typeId: '',
        typeName: '',
        score: ''
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
    setType(val) {
      this.type = { ...val }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = false
          if (!this.type.typeId) {
            // create
            this.$post('examination/type', { ...this.type }).then(() => {
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
            this.type.createTime = this.type.updateTime = null
            this.$put('examination/type', { ...this.type }).then(() => {
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
      this.type = this.initType()
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
