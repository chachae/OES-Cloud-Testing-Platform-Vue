<template>
  <div class="app-container">
    <div v-show="paperListShow" id="paperList">
      <template v-if="normalPaper.length === 0 && imitatePaper.length === 0">
        <el-link class="no-perm">
          暂无考试
        </el-link>
      </template>
      <template v-if="normalPaper.length !== 0">
        <div class="filter-container">
          <h3 class="view-item">正式考试</h3>
        </div>
        <el-row :gutter="12" style="margin-bottom: 20px">
          <el-col v-for="paper in normalPaper" :key="paper.paperId" :span="8">
            <el-card class="view-item" style="background-color: rgba(236,251,252,0.3)">
              <div slot="header">
                <span>{{ paper.paperName }}</span>
                <el-button style="float: right; padding: 3px 0" type="text" @click="detail(paper)">进入</el-button>
              </div>
              <div class="view-item">
                <div class="view-item">
                  <i class="el-icon-star-on" /> <span>{{ $t('table.paper.startTime') +'：' }}</span>
                  {{ paper.startTime | parseTime('{y}年{m}月{d}日 {h}点{i}分') }}
                </div>
                <div class="view-item">
                  <i class="el-icon-star-on" /> <span>{{ $t('table.paper.endTime') +'：' }}</span>
                  {{ paper.endTime | parseTime('{y}年{m}月{d}日 {h}点{i}分') }}
                </div>
                <div class="view-item">
                  <i class="el-icon-star-on" /> <span>{{ $t('table.paper.minute') +'：' }}</span>
                  {{ paper.minute }} 分钟
                </div>
                <div class="view-item">
                  <i class="el-icon-star-on" /> <span>{{ $t('table.paper.paperScore') +'：' }}</span>
                  {{ paper.paperScore }} 分
                </div>
                <div class="view-item">
                  <i class="el-icon-star-on" /> <span>{{ $t('table.paper.termName') +'：' }}</span>
                  {{ paper.termName }}
                </div>
                <div class="view-item">
                  <i class="el-icon-star-on" /> <span>{{ $t('table.paper.status') +'：' }}</span>
                  {{ transStatus( paper.isStart,paper.isEnd ) }}
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>
      <template v-if="imitatePaper.length !== 0">
        <div class="filter-container">
          <h3 class="view-item">模拟考试</h3>
        </div>
        <el-row v-if="imitatePaper.length !== 0" :gutter="12">
          <el-col v-for="paper in imitatePaper" :key="paper.paperId" :span="8">
            <el-card class="view-item" style="background-color: rgba(236,251,252,0.3)">
              <div slot="header">
                <span>{{ paper.paperName }}</span>
                <el-button style="float: right; padding: 3px 0" type="text" @click="detail(paper)">进入</el-button>
              </div>
              <div class="view-item">
                <div class="view-item">
                  <i class="el-icon-star-on" /> <span>{{ $t('table.paper.startTime') +'：' }}</span>
                  {{ paper.startTime | parseTime('{y}年{m}月{d}日 {h}点{i}分') }}
                </div>
                <div class="view-item">
                  <i class="el-icon-star-on" /> <span>{{ $t('table.paper.endTime') +'：' }}</span>
                  {{ paper.endTime | parseTime('{y}年{m}月{d}日 {h}点{i}分') }}
                </div>
                <div class="view-item">
                  <i class="el-icon-star-on" /> <span>{{ $t('table.paper.minute') +'：' }}</span>
                  {{ paper.minute }} 分钟
                </div>
                <div class="view-item">
                  <i class="el-icon-star-on" /> <span>{{ $t('table.paper.paperScore') +'：' }}</span>
                  {{ paper.paperScore }} 分
                </div>
                <div class="view-item">
                  <i class="el-icon-star-on" /> <span>{{ $t('table.paper.termName') +'：' }}</span>
                  {{ paper.termName }}
                </div>
                <div class="view-item">
                  <i class="el-icon-star-on" /> <span>{{ $t('table.paper.status') +'：' }}</span>
                  {{ transStatus( paper.isStart,paper.isEnd ) }}
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </template>
    </div>
  </div>
</template>
<script>

export default {
  name: 'MyExamMange',
  data() {
    return {
      dialog: {
        isDetailShow: false,
        title: ''
      },
      tableKey: 0,
      paperListShow: true,
      examDetailShow: false,
      loading: false,
      normalPaper: [],
      imitatePaper: []
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    }
  },
  mounted() {
    this.fetch()
  },
  methods: {
    transStatus(start, end) {
      if (!start) {
        return this.$t('table.paper.unStart')
      } else if (start && !end) {
        return this.$t('table.paper.between')
      } else {
        return this.$t('table.paper.end')
      }
    },
    fetch(params = {}) {
      this.loading = true
      this.$get('exam-online/exam/normal', {
        ...params
      }).then((r) => {
        const data = r.data.data
        this.normalPaper = data.rows
        this.loading = false
      })
      this.$get('exam-online/exam/imitate', {
        ...params
      }).then((r) => {
        const data = r.data.data
        this.imitatePaper = data.rows
        this.loading = false
      })
    },
    detailClose() {
      this.examDetailShow = false
      this.paperListShow = true
    },
    detail(row) {
      this.$get('system/id-card/verify/check').then((r) => {
        if (!r.data) {
          this.$alert('个人身份信息暂未核验，请在个人中心内核验身份信息', this.$t('table.exam.tips'), {
            confirmButtonText: this.$t('common.confirm'),
            type: 'warning'
          })
        } else if (!row.isStart) {
          this.$alert(this.$t('table.paper.unStart'), this.$t('table.exam.tips'), {
            confirmButtonText: this.$t('common.confirm'),
            type: 'warning'
          })
        } else {
          this.$get(`exam-online/score/check?paperId=${row.paperId}`).then((r) => {
            if (r.data) {
              // 跳转考试
              const routeUrl = this.$router.resolve({
                path: `/do-exam/${row.paperId}`,
                params: { exam: row }
              })
              window.open(routeUrl.href, '_blank')
            } else {
              this.$alert(this.$t('table.exam.hasSubmit'), this.$t('table.exam.tips'), {
                confirmButtonText: this.$t('common.confirm'),
                type: 'warning'
              })
            }
          })
        }
      })
    },
    reset() {
      this.queryParams = {}
      this.$refs.table.clearSort()
      this.$refs.table.clearFilter()
      this.search()
    }
  }
}
</script>

<style lang="scss" scoped>
  .view-item {
    margin: 7px;

    i {
      font-size: .120rem;
      color: #E6A23C;
    }

    span {
      margin-left: 5px;
    }
  }
</style>
