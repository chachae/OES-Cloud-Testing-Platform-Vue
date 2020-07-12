<template>
  <el-dialog
    :title="$t('common.view')"
    :width="width"
    :visible.sync="isVisible"
    class="content-view"
  >
    <div class="el-dialog-div">
      <div class="view-item">
        <div v-html="content.htmlContent" />
      </div>
    </div>
  </el-dialog>
</template>
<script>
export default {
  name: 'AnnounceView',
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
      content: {},
      announce: {}
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
        return '85%'
      } else if (this.screenWidth < 1400) {
        return '85%'
      } else {
        return '85%'
      }
    },
    setContent(val) {
      this.content = { ...val }
    },
    setAnnounce(val) {
      this.announce = { ...val }
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>
<style lang="scss" scoped>
  .el-dialog-div{
    height: 60vh;
    overflow: auto;
  }
  .content-view {
    .text-wrapper {
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
