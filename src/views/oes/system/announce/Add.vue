<template>
  <div class="app-container">
    <aside>
      <span>
        <el-link type="primary">
          基于 TinyMCE 富文深度定制组件，整合多样化 ToolBar 与七牛云图片上传
        </el-link>
      </span>
    </aside>
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
    <div class="editor-content" v-html="announce.htmlContent" />
    <el-button style="margin-top:10px;" plain type="primary" @click="submitForm">
      发布公告
    </el-button>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'

export default {
  name: 'AnnounceAdd',
  components: { Tinymce },
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
      announce: this.initAnnounce(),
      rules: {
        title: [{ required: true, message: this.$t('rules.require'), trigger: 'blur' }]
      }
    }
  },
  methods: {
    submitForm() {
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
          this.$post('system/announce', { ...this.announce }).then((r) => {
            this.reset()
            this.$emit('success')
            this.$message({
              message: this.$t('tips.createSuccess'),
              type: 'success'
            })
          })
        }
      })
    },
    initAnnounce() {
      return {
        creatorName: '',
        title: '',
        htmlContent: ''
      }
    },
    reset() {
      // 先清除校验，再清除表单，不然有奇怪的bug
      this.$refs.form.clearValidate()
      this.$refs.form.resetFields()
      this.$refs.content.setContent('')
      this.announce = this.initAnnounce()
    }
  }
}
</script>
<style lang="scss" scoped>
  .editor-content{
    margin-top: 20px;
  }
</style>

