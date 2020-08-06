<template>
  <el-dialog
    :title="$t('common.view')"
    :width="width"
    :visible.sync="isVisible"
    class="user-view"
  >
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          姓名：{{ violateLog.fullName }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          用户名：{{ violateLog.username }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          考试场次：{{ violateLog.paperName }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          课程名称：{{ violateLog.courseName }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24">
        <div class="view-item">
          违规描述信息：{{ violateLog.description }}
        </div>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<script>
export default {
  name: 'UserView',
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
      violateLog: {}
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
        return '580px'
      } else if (this.screenWidth < 1400) {
        return '600px'
      } else {
        return '650px'
      }
    },
    setViolateLog(val) {
      this.violateLog = { ...val }
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>
<style lang="scss" scoped>
  .user-view {
    .img-wrapper {
      text-align: center;
      margin-top: -1.5rem;
      margin-bottom: 10px;
      img {
        width: 4rem;
        border-radius: 50%;
      }
    }
    .view-item {
      margin: 7px;
      i {
        font-size: .97rem;
      }
      span {
        margin-left: 5px;
      }
    }
  }
</style>
