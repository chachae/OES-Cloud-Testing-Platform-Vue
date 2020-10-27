<template>
  <div class="app-container">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="试卷列表" name="papers">
        <PaperList :terms="terms" />
      </el-tab-pane>
      <el-tab-pane label="随机组卷" name="random">
        <Random :courses="courses" :terms="terms" :types="types" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import PaperList from './list/Index'
import Random from './random/Index'
import { courseOptions } from '@/api/exam/basic/course'
import { typeOptions } from '@/api/exam/basic/type'
import { termOptions } from '@/api/exam/basic/term'
export default {
  name: 'PaperManage',
  components: { PaperList, Random },
  data() {
    return {
      activeTab: null,
      courses: [],
      types: [],
      terms: []
    }
  },
  mounted() {
    this.initTypes()
    this.initTerms()
    this.initCourses()
    this.activeTab = 'random'
  },

  methods: {
    initCourses() {
      courseOptions().then((r) => {
        this.courses = r.data.data
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    initTypes() {
      typeOptions().then((r) => {
        this.types = r.data.data
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    initTerms() {
      termOptions().then((r) => {
        this.terms = r.data.data
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    }
  }
}
</script>
