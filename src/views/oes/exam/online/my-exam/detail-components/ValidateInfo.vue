<!-- 考试信息验证 -->
<template>
  <div>
    <div
      v-if="!idCardStatus"
      class="warning custom-block"
      style="margin: 0 0 1.2rem 0"
    >
      <p class="custom-block-title">WARNING</p>
      <p>
        <strong>身份证未核验：</strong>请到个人中心进行身份证实名认证<br>
      </p>
    </div>

    <div
      v-if="!canTest"
      class="tip custom-block"
      style="margin: 0 0 1.2rem 0"
    >
      <p class="custom-block-title">TIP</p>
      <p>
        <strong>考试状态：</strong>已经参与本轮考试，无需再次参加<br>
      </p>
    </div>

    <div
      v-if="!isPaperExist"
      class="warning custom-block"
      style="margin: 0 0 1.2rem 0"
    >
      <p class="custom-block-title">WARNING</p>
      <p>
        <strong>试卷状态：</strong>试卷不存在！
      </p>
    </div>
  </div>
</template>

<script>
import { getExamPaper } from '@/api/exam/online/exam'

export default {
  name: 'Validate',

  data() {
    return {
      exam: '',
      queryInfo: {},
      // 身份证核验状态
      idCardStatus: true,
      // 是否已经考过
      canTest: true,
      // 试卷是否存在
      isPaperExist: true
    }
  },

  methods: {

    fetchValidate(queryInfo) {
      this.queryInfo = queryInfo
      this.validateAll()
    },

    // 获取试题数据
    async getExamPaper() {
      await getExamPaper(this.queryInfo.paperId).then((r) => {
        if (r.data.data) {
          this.exam = r.data.data
        } else {
          this.isPaperExist = false
        }
      })
    },

    // 同步检验信息
    async validateAll() {
      await this.checkIdCard()
      if (this.idCardStatus) {
        await this.checkScore()
        if (this.canTest) {
          await this.getExamPaper()
          if (this.isPaperExist) {
            this.$emit('validateOk', this.exam)
          }
        }
      }
    },

    async checkIdCard() {
      await this.$get('system/id-card/verify/check').then((r) => {
        if (!r.data) {
          this.idCardStatus = false
          this.$alert('个人身份信息暂未核验，请在个人中心内核验身份信息', this.$t('table.exam.tips'), {
            confirmButtonText: this.$t('common.confirm'),
            type: 'warning'
          })
        }
      })
    },

    async checkScore() {
      await this.$get(`exam-online/score/check?paperId=${this.queryInfo.paperId}`).then((r) => {
        if (!r.data) {
          this.canTest = false
          this.$alert(this.$t('table.exam.hasSubmit'), this.$t('table.exam.tips'), {
            confirmButtonText: this.$t('common.confirm'),
            type: 'warning'
          })
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
