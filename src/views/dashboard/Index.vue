<template>
  <div class="main">
    <el-row :gutter="10">
      <el-col :xs="24" :sm="4">
        <div class="app-container" style="height: 120px;padding: 0">
          <el-card :body-style="{ padding: '0px' }" shadow="never" style="height: 100px">
            <div class="count-header">
              <img alt="" :src="resolveIcon('count1.svg')">
              <span class="des">{{ $t('common.todayIp') }}</span>
              <countTo class="countTo todayIp" :start-val="0" :end-val="todayIp" :duration="2000" />
            </div>
          </el-card>
        </div>
      </el-col>
      <el-col :xs="24" :sm="4">
        <div class="app-container" style="height: 120px;padding: 0">
          <el-card :body-style="{ padding: '0px' }" shadow="never" style="height: 100px">
            <div class="count-header">
              <img alt="" :src="resolveIcon('count2.svg')">
              <span class="des">{{ $t('common.todayVisit') }}</span>
              <countTo class="countTo todayVisit" :start-val="0" :end-val="todayVisit" :duration="2000" />
            </div>
          </el-card>
        </div>
      </el-col>
      <el-col :xs="24" :sm="4">
        <div class="app-container" style="height: 120px;padding: 0">
          <el-card :body-style="{ padding: '0px' }" shadow="never" style="height: 100px">
            <div class="count-header">
              <img alt="" :src="resolveIcon('count3.svg')">
              <span class="des">{{ $t('common.TotalVisit') }}</span>
              <countTo class="countTo totalVisit" :start-val="0" :end-val="totalVisit" :duration="2000" />
            </div>
          </el-card>
        </div>
      </el-col>
      <el-col :xs="24" :sm="4">
        <div class="app-container" style="height: 120px;padding: 0">
          <el-card :body-style="{ padding: '0px' }" shadow="never" style="height: 100px">
            <div class="count-header">
              <img alt="" :src="resolveIcon('count4.svg')">
              <span class="des">总试卷量</span>
              <countTo class="countTo todayIp" :start-val="0" :end-val="totalPaper" :duration="2000" />
            </div>
          </el-card>
        </div>
      </el-col>
      <el-col :xs="24" :sm="4">
        <div class="app-container" style="height: 120px;padding: 0">
          <el-card :body-style="{ padding: '0px' }" shadow="never" style="height: 100px">
            <div class="count-header">
              <img alt="" :src="resolveIcon('count5.svg')">
              <span class="des">总试题量</span>
              <countTo class="countTo todayVisit" :start-val="0" :end-val="totalQuestion" :duration="2000" />
            </div>
          </el-card>
        </div>
      </el-col>
      <el-col :xs="24" :sm="4">
        <div class="app-container" style="height: 120px;padding: 0">
          <el-card :body-style="{ padding: '0px' }" shadow="never" style="height: 100px">
            <div class="count-header">
              <img alt="" :src="resolveIcon('count6.svg')">
              <span class="des">总答题量</span>
              <countTo class="countTo totalVisit" :start-val="0" :end-val="totalAnswer" :duration="2000" />
            </div>
          </el-card>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="app-container">
          <el-row :gutter="10">
            <el-col :xs="24" :sm="24" :lg="24">
              <!-- 最近十天访问记录 -->
              <VisitCountChart
                v-if="flag"
                ref="visitChart"
                :last-ten-user-visit-count="lastTenUserVisitCount"
                :last-ten-visit-count="lastTenVisitCount"
              />
            </el-col>
          </el-row>
        </div>
      </el-col>
      <!-- oss 文件存储统计 -->
      <el-col :xs="24" :sm="12" :lg="12">
        <oss-files-top10-pie-chart />
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :lg="8">
        <!-- 各类型题目的题目数量分布情况 -->
        <type-distribute-pie-chart
          v-if="examBasicFlag"
          :type-count-distribute="typeCountDistribute"
        />
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <!-- 统计各科目试卷量前十 -->
        <question-top10-pie-chart
          v-if="examBasicFlag"
          :top-ten-question="topTenQuestion"
        />
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <!-- 最近十天访问记录 -->
        <paper-top10-pie-chart
          v-if="examBasicFlag"
          :top-ten-paper="topTenPaper"
        />
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <!-- 系统公告table -->
        <announce-table />
      </el-col>
      <el-col :xs="24" :sm="12">
        <!-- 系统服务table -->
        <server-table />
      </el-col>
    </el-row>
    <el-divider />
  </div>
</template>
<script>
import { userIndex } from '@/api/system/user'
import { examIndex } from '@/api/exam/basic/statistic'
import AnnounceTable from './AnnounceTable'
import countTo from 'vue-count-to'
import VisitCountChart from './VisitCountChart'
import ServerTable from './ServerTable'
import QuestionTop10PieChart from './QuestionTop10PieChart'
import TypeDistributePieChart from './TypeDistributePieChart'
import PaperTop10PieChart from './PaperTop10PieChart'
import OssFilesTop10PieChart from './OssFilesTop10PieChart'
export default {
  name: 'Dashboard',
  components: { OssFilesTop10PieChart, PaperTop10PieChart, TypeDistributePieChart, countTo, AnnounceTable, VisitCountChart, QuestionTop10PieChart, ServerTable },
  filters: {
    portFilter(v) {
      const map = {
        0: 'danger',
        1: 'success'
      }
      return map[status]
    }
  },
  data() {
    return {
      // 控制 echart 数据渲染 prop 传值为空，https://www.cnblogs.com/goloving/p/9114236.html
      flag: false,
      examBasicFlag: false,
      welcomeMessage: '',
      todayIp: 0,
      todayVisit: 0,
      totalVisit: 0,
      totalPaper: 0,
      totalQuestion: 0,
      totalAnswer: 0,
      lastTenVisitCount: [],
      lastTenUserVisitCount: [],
      topTenPaper: [],
      topTenQuestion: [],
      typeCountDistribute: [],
      indexData: '',
      chart: null
    }
  },
  computed: {
    user() {
      return this.$store.state.account.user
    },
    avatar() {
      return require(`@/assets/avatar/${this.user.avatar}`)
    }
  },
  mounted() {
    this.welcomeMessage = this.welcome()
    this.initIndexData()
    this.initExamBasicData()
  },
  methods: {
    resolveIcon(icon) {
      return require(`@/assets/icons/${icon}`)
    },
    initIndexData() {
      userIndex().then((r) => {
        this.indexData = r.data.data
        this.todayIp = this.indexData.todayIp
        this.totalVisit = this.indexData.totalVisitCount
        this.todayVisit = this.indexData.todayVisitCount
        this.lastTenVisitCount = this.indexData.lastTenVisitCount
        this.lastTenUserVisitCount = this.indexData.lastTenUserVisitCount
        this.flag = true
      })
    },
    initExamBasicData() {
      examIndex().then((r) => {
        const res = r.data.data
        this.totalPaper = res.totalPaper
        this.totalQuestion = res.totalQuestion
        this.totalAnswer = res.totalAnswer
        this.topTenPaper = res.topTenPaper
        this.topTenQuestion = res.topTenQuestion
        this.typeCountDistribute = res.typeCountDistribute
        this.examBasicFlag = true
      })
    },
    welcome() {
      const date = new Date()
      const hour = date.getHours()
      const time = hour < 6 ? this.$t('common.goodMorning') : (hour <= 11 ? this.$t('common.goodMorning') : (hour <= 13 ? this.$t('common.goodAfternoon') : (hour <= 18 ? this.$t('common.goodAfternoon') : this.$t('common.goodEvening'))))
      const welcomeArr = [
        this.$t('common.randomMessage.a'),
        this.$t('common.randomMessage.b'),
        this.$t('common.randomMessage.c'),
        this.$t('common.randomMessage.d'),
        this.$t('common.randomMessage.e'),
        this.$t('common.randomMessage.f'),
        this.$t('common.randomMessage.g'),
        this.$t('common.randomMessage.h'),
        this.$t('common.randomMessage.i')
      ]
      const index = Math.floor((Math.random() * welcomeArr.length))
      return `${time}, ${this.user.fullName}, ${welcomeArr[index]}`
    },
    load() {
      this.count += 2
    },
    viewClose() {
      this.announceViewVisible = false
    }
  }
}
</script>
<style lang="scss">
  .main {
    .el-card {
      border: none;
      border-radius: 2px;
    }
    .el-table.server-table {
      th {
        height: 2.7rem;
        padding: 7px 0;
        border-right: none;
      }
      td {
        padding: 7px 0;
        border-right: none;
      }
    }
    .count-header {
      padding-left: 1rem;
      height: 120px;
      line-height: 120px;
      text-align: left;
      vertical-align: center;
      img {
        width: 3.8rem;
        margin-top: 1.8rem;
        vertical-align: top;
      }
      span {
        font-size: 15px;
        color: #606266;
        font-weight: 600;
        &.des {
          margin-left: 9px;
        }
      }
    }
    .todayIp {
      color: #27c6da !important;
    }
    .todayVisit {
      color: #fc573b !important;
    }
    .totalVisit {
      color: #be63f9 !important;
    }
  }
</style>
<style lang="scss" scoped>
  .main {
    padding: 10px;
    .app-container {
      margin: 0 0 10px 0;
    }
    .user-container {
      padding: 15px;
    }
    .user-wrapper {
      width: 100%;
      display: inline-block;
      .user-header {
        display: inline-block;
        vertical-align: middle;
        img {
          width: 5rem;
          margin: .5rem 1rem;
          border-radius: 50%
        }
      }
      .user-info {
        display: inline-block;
        vertical-align: middle;
        .random-message {
          font-size: 1rem;
          margin-bottom: .5rem;
          color: #333;
        }
        .user-dept, .user-login-info {
          color: rgba(0, 0, 0, 0.45);
          margin-bottom: .5rem;
          font-size: .9rem;
          line-height: 1.1rem;
        }
      }
    }
    .user-visits {
      text-align: center;
      padding-right: 2rem;
      margin-top: 1rem;
      vertical-align: middle;
      .num {
        font-weight: 600;
      }
    }
    .project-wrapper {
      padding: 0;
      .project-header {
        padding: 18px;
        margin-bottom: 16px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        td {
          width: 50%;
          border-top: 1px solid #f1f1f1;
          border-bottom: 1px solid #f1f1f1;
          padding: .7rem;
          .project-avatar-wrapper {
            display:inline-block;
            float:left;
            margin-right:.7rem;
            .project-avatar {
              color: #42b983;
              background-color: #d6f8b8;
            }
          }
          &:nth-child(odd) {
            border-right: 1px solid #f1f1f1;
          }
        }
      }
      .project-detail {
        display:inline-block;
        float:left;
        text-align:left;
        width: 75%;
        .project-name {
          font-size:.9rem;
          margin-top:-2px;
          font-weight:600;
        }
        .project-desc {
          color:rgba(0, 0, 0, 0.45);
          p {
            margin: 5px 0 0 0;
            font-size: .85rem;
            line-height: 1.4rem;
            white-space:normal;
          }
        }
      }
    }
    @media screen and (max-width: 1366px)
    {
      .user-info {
        max-width: 25rem;
      }
    }
    @media screen and (max-width: 1300px)
    {
      .user-info {
        max-width: 19rem;
      }
    }

    @media screen and (max-width: 1120px)
    {
      .user-info {
        max-width: 17rem;
      }
    }
  }
</style>
