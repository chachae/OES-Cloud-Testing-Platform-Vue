<template>
  <el-dialog
    title="关于系统"
    :width="width"
    :visible.sync="isVisible"
    class="oes-info-view"
    :append-to-body="true"
  >
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24">
        <div class="img-wrapper">
          <img :src="resolveLogo('oes-cloud.png')">
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item" style="font-size: 1rem; font-weight: bold">
          <span>OES-Cloud 基于分布式架构的多端在线考试平台</span>
        </div>
        <div class="view-item">
          <p>
            本系统致力于打造一个安全、考生行为远程及现场高度可监控、集中型数据处理的在线考试平台
          </p>
          <p>
            本在线考试平台使用 Spring Cloud 完成服端服务构建
          </p>
          <p>
            采用前后端分离 Vue 企业级微服务敏捷开发系统架构
          </p>
          <p>
            引入组件化的思想实现「高内聚低耦合」
          </p>
          <p>
            基于 RBAC、JWT 与 OAuth 2 的无状态可续签的统一认证授权解决方案
          </p>
          <p>
            并提供应用管理方便第三方系统接入
          </p>
          <p>
            集合各类微服务治理功能和 APM 监控系统
          </p>
          <p>
            在现代微服务架构的基础和服务增强之上构建在线考试的微服务核心
          </p>
          <p>
            内建 oes-ai 微服务，包含OCR 卡证、人脸对比、人脸识别等
          </p>
          <p>
            结合多种设计模式完成多方接口的适配工作
          </p>
          <p>
            内建防作弊系统，考生信息加密核验、人脸对比、行为监控、考试过程自动化控制
          </p>
          <p>
            通过外部数据流提供统一接口对考生考试行为进行监听和控制
          </p>
          <p>
            使用消息队列实现答案实时异步提交和违规行为记录日志
          </p>
          <p>
            平台提供系统重要数据的数据支持报表
          </p>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" style="text-align: center">
        <div class="view-item" style="font-size: 1rem; font-weight: bold">
          <span>鸣谢以下开源项目和三方服务「排名不分先后」</span>
        </div>
        <div v-for="(map,index) in list" :key="index" class="view-item">
          <span>{{ map.key }} : </span>{{ map.value }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10" style="text-align: center">
      <el-col :xs="24" :sm="24">
        <div class="view-item" style="font-size: 1rem; font-weight: bold">
          <div>
            <el-link type="primary"><a href="https://github.com/chachae/oes-cloud" target="_blank">友情指路：OES-Cloud 服务端</a></el-link>
          </div>
          <div>
            <el-link type="primary"><a href="https://github.com/chachae/oes-web" target="_blank">友情指路：OES-Cloud 客户端</a></el-link>
          </div>
        </div>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<script>
export default {
  name: 'OesInfo',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      screenWidth: 0,
      width: this.initWidth(),
      list: [
        { key: 'ORM', value: 'MyBatis-Plus' },
        { key: '微服务网关', value: 'Gateway' },
        { key: '云对象存储服务', value: 'QiNiu' },
        { key: '注册中心与配置中心', value: 'Nacos' },
        { key: '分布式消息中间件', value: 'RabbitMQ' },
        { key: '前端人脸识别框架', value: 'Tracking.js' },
        { key: '分布式事务控制', value: 'TX-LCN / Seata' },
        { key: '数据库', value: 'MySQL / Redis / MongoDB' },
        { key: '分库分表解决方案', value: 'ShardingSphere' },
        { key: '渐进式框架与组件库', value: 'Vue.js / Element' },
        { key: '单点认证授权', value: 'Spring Security OAuth2' },
        { key: 'OCR 文字识别与人脸对比相关', value: 'Baidu AI / Ali-AI' },
        { key: '服务端框架', value: 'SpringCloud Hoxton.SR3 & Alibaba' }
      ]
    }
  },
  computed: {
    isVisible: {
      get() {
        return this.dialogVisible
      },
      set() {
        this.close()
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
      if (this.screenWidth < 550) {
        return '95%'
      } else if (this.screenWidth < 990) {
        return '90%'
      } else if (this.screenWidth < 1400) {
        return '85%'
      } else {
        return '80%'
      }
    },
    resolveLogo(logo) {
      return require(`@/assets/logo/${logo}`)
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>
<style lang="scss" scoped>
  .oes-info-view {
    .img-wrapper {
      text-align: center;
      margin-top: -1.5rem;
      margin-bottom: 10px;
      img {
        width: 7rem;
        border-radius: 80%;
      }
    }
    .view-item {
      margin: 1rem;
      i {
        font-size: .98rem;
      }
    }
  }
</style>
