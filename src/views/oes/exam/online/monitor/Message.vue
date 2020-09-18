<template>
  <el-dialog
    title="发送消息"
    :width="width"
    top="50px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-form ref="form" :model="message" :rules="rules" label-position="right" label-width="100px">
      <el-input v-model="message.content" />
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
import { sendOne } from '@/api/exam/online/socket'
export default {
  name: 'SendMessage',
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
      buttonLoading: false,
      screenWidth: 0,
      width: this.initWidth(),
      rules: {
        content: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' }
        ]
      },
      message: {
        command: 'message',
        fromId: '',
        toId: '',
        content: ''
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
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = false
          sendOne(JSON.stringify(this.message))
          this.buttonLoading = false
          this.isVisible = false
          this.$message({
            message: '发送成功',
            type: 'success'
          })
          this.message.content = null
          this.$emit('success')
        }
      })
    },
    setInfo(fromId, toId) {
      this.message.fromId = fromId
      this.message.toId = toId
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

