<template>
  <div class="app-container">
    <div class="tip custom-block" style="margin: -1.2rem 0 1.2rem 0">
      <p>基于 TinyMCE 富文深度定制组件，整合多样化 ToolBar 与七牛云图片上传</p>
    </div>
    <div>
      <el-form ref="form" :model="announce" :rules="rules">
        <el-form-item prop="title">
          <el-input v-model="announce.title" placeholder="公告标题" maxlength="30" />
        </el-form-item>
        <el-form-item hidden prop="content">
          <el-input v-model="announce.htmlContent" />
        </el-form-item>
      </el-form>
    </div>
    <div>
      <tinymce ref="content" v-model="announce.htmlContent" :height="300" />
    </div>
    <el-button style="margin-top:10px;" plain type="success" @click="view">
      预览
    </el-button>
    <el-button style="margin-top:10px;" plain type="primary" @click="submitForm(1)">
      立即发布
    </el-button>
    <el-button style="margin-top:10px;" plain type="info" @click="submitForm(0)">
      存为草稿
    </el-button>
    <!-- 查看 -->
    <announce-view
      ref="view"
      :dialog-visible="announceViewVisible"
      @close="viewClose"
    />
  </div>
</template>

<script>
import AnnounceView from './View'
import Tinymce from '@/components/Tinymce'

export default {
  name: 'AnnounceAdd',
  components: { Tinymce, AnnounceView },
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          fullName: ''
        }
      }
    }
  },
  data() {
    return {
      announceViewVisible: false,
      announce: this.initAnnounce(),
      rules: {
        title: [{ required: true, message: this.$t('rules.require'), trigger: 'blur' }]
      }
    }
  },
  methods: {
    viewClose() {
      this.announceViewVisible = false
    },
    view() {
      this.$refs.view.setAnnounce(this.announce)
      this.$refs.view.setContent(this.announce)
      this.announceViewVisible = true
    },
    submitForm(status) {
      this.$refs.form.validate((valid) => {
        if (!this.announce.htmlContent) {
          this.$alert('公告内容不能为空', '提示', {
            confirmButtonText: this.$t('common.confirm'),
            type: 'warning'
          })
          return false
        }
        if (valid) {
          this.announce.creatorName = this.user.fullName
          this.announce.status = status
          if (this.announce.contentId) {
            this.announce.createTime = this.announce.updateTime = null
            this.$put('system/announce', { ...this.announce }).then(() => {
              this.reset()
              this.$emit('success')
              this.$message({
                message: this.$t('tips.createSuccess'),
                type: 'success'
              })
            })
          } else {
            this.$post('system/announce', { ...this.announce }).then(() => {
              this.reset()
              this.$emit('success')
              this.$message({
                message: this.$t('tips.createSuccess'),
                type: 'success'
              })
            })
          }
        }
      })
    },
    initAnnounce() {
      return {
        creatorName: '',
        title: '',
        htmlContent: '欢迎使用'
      }
    },
    setAnnounce(val) {
      this.announce = { ...val }
    },
    setContent(val) {
      const res = { ...val }
      this.announce.htmlContent = res.htmlContent
      this.$refs.content.setContent(this.announce.htmlContent)
    },
    reset() {
      // 先清除校验，再清除表单，不然有奇怪的bug
      this.$refs.form.clearValidate()
      this.$refs.form.resetFields()
      this.$refs.content.setContent('')
    }
  }
}
</script>
<style lang="scss" scoped>
  .editor-content{
    margin-top: 20px;
  }
</style>

