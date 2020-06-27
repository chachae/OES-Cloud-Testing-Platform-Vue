<template>
  <el-dialog
    :title="title"
    :width="width"
    top="50px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24">
        <div class="view-item">
          <span>{{ $t('table.exam.pledge.a') }}</span>
        </div><br>
        <div class="view-item">
          <span>{{ $t('table.exam.pledge.b') }}</span>
        </div><br>
        <div class="view-item">
          <span>{{ $t('table.exam.pledge.c') }}</span>
        </div><br>
        <div class="view-item">
          <span>{{ $t('table.exam.pledge.d') }}</span>
        </div><br>
        <div class="view-item">
          <span>{{ $t('table.exam.pledge.e') }}</span>
        </div><br>
        <div class="view-item">
          <span>{{ $t('table.exam.pledge.f') }}</span>
        </div><br>
        <el-checkbox v-model="isRead" :disabled="isRead">我已阅读</el-checkbox>
      </el-col>
    </el-row>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="buttonLoading" @click="submitPledge">
        {{ $t('common.confirm') }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'Pledge',
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
      buttonLoading: false,
      screenWidth: 0,
      isRead: null,
      paperQuestion: null,
      width: this.initWidth()
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
    submitPledge() {
      this.buttonLoading = false
      this.isVisible = false
      if (this.isRead) {
        this.$emit('isRead')
      }
    },
    setRead(isRead) {
      this.isRead = isRead
    },
    close() {
      this.$emit('close')
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
    }
  }
}
</script>

<style lang="scss" scoped>
  .question-view {
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
