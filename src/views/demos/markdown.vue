<template>
  <div class="app-container">
    <aside>
      <span>
        <a href="https://panjiachen.github.io/vue-element-admin-site/feature/component/markdown-editor.html" target="_blank">tui markdown编辑器文档</a>
      </span>
    </aside>

    <div class="editor-container">
      <markdown-editor ref="markdownEditor" v-model="content4" language="zh_CN" height="300px" />
    </div>

    <el-button style="margin-top:10px;" type="primary" icon="el-icon-document" @click="getHtml">
      Get HTML
    </el-button>
    <div v-html="html" />
  </div>
</template>

<script>
import MarkdownEditor from '@/components/MarkdownEditor'

const content = `
基于**Spring Cloud Greenwich.SR3**、**Spring Cloud OAuth2** & **Spring Cloud Alibaba** & **Element** 构建的微服务权限管理系统。系统特点：前后端分离、认证/资源服务器分离、RBAC模型、第三方账号登录、多维度监控（Prometheus APM：Docker容器监控，MySQL监控、微服务JVM监控、Redis监控）、服务预警（邮件预警，企业微信预警）、Skywalking服务追踪、ELK日志系统、Nacos集中管理配置和服务、Sentinel流控、动态Client管理、支持多种格式令牌、注解驱动、代码生成、Excel导入导出等。
`

export default {
  name: 'MarkdownDemo',
  components: { MarkdownEditor },
  data() {
    return {
      content4: content,
      html: '',
      defaultLanguage: 'zh',
      languageTypeList: {
        'en': 'en_US',
        'zh': 'zh_CN'
      }
    }
  },
  computed: {
    language() {
      return this.languageTypeList[this.defaultLanguage]
    }
  },
  methods: {
    getHtml() {
      this.html = this.$refs.markdownEditor.getHtml()
      console.log(this.html)
    }
  }
}
</script>

<style scoped>
  .editor-container{
    margin-bottom: 30px;
  }
</style>
