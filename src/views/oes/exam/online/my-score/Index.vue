<template>
  <div class="score">
    <el-row :gutter="10">
      <el-col :xs="24" :sm="statisticScore.paperName !== '' ? 14 : 24">
        <div class="app-container">
          <div v-show="scoreIndexShow">
            <div class="filter-container">
              <el-input
                v-model="queryParams.paperName"
                :placeholder="$t('table.paper.paperName')"
                class="filter-item search-item"
              />
              <el-select
                v-model="queryParams.termId"
                class="filter-item search-item"
                value=""
                :placeholder="$t('table.score.termName')"
              >
                <el-option
                  v-for="item in terms"
                  :key="item.termId"
                  :label="item.termName"
                  :value="item.termId"
                />
              </el-select>
              <el-button class="filter-item" type="primary" @click="search">
                {{ $t('table.search') }}
              </el-button>
              <el-button class="filter-item" type="warning" @click="reset">
                {{ $t('table.reset') }}
              </el-button>
            </div>
            <el-table
              ref="table"
              :key="tableKey"
              :data="list"
              border
              fit
              style="width: 100%;"
            >
              <el-table-column
                :label="$t('table.score.paperName')"
                prop="paperName"
                :show-overflow-tooltip="true"
                align="center"
                min-width="80px"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.paperName }}</span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('table.score.courseName')"
                prop="times"
                :show-overflow-tooltip="true"
                align="center"
                min-width="80px"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.courseName }}</span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('table.score.termName')"
                prop="termName"
                :show-overflow-tooltip="true"
                align="center"
                min-width="80px"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.termName }}</span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('table.answer.studentName')"
                prop="studentName"
                :show-overflow-tooltip="true"
                align="center"
                min-width="60px"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.fullName }}</span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('table.score.status')"
                prop="status"
                :show-overflow-tooltip="true"
                align="center"
                min-width="50px"
              >
                <template slot-scope="{row}">
                  <el-tag :type="row.status | statusFilter">
                    {{ row.status === 1 ? $t('table.score.ok'): $t('table.score.bad') }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('table.score.times')"
                prop="times"
                :show-overflow-tooltip="true"
                align="center"
                min-width="80px"
              >
                <template slot-scope="scope">
                  <span>{{ !scope.row.times ? $t('table.score.hasNothing') :scope.row.times }}</span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('table.score.studentScore')"
                prop="times"
                :show-overflow-tooltip="true"
                align="center"
                min-width="80px"
              >
                <template slot-scope="{row}">
                  <el-tag :type="row.studentScore | scoreFilter">
                    <span>{{ row.studentScore }} 分</span>
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('table.operation')"
                align="center"
                min-width="110px"
                class-name="small-padding fixed-width"
              >
                <template slot-scope="{row}">
                  <i class="el-icon-view table-operation" style="color: #68b1d0;" @click="statistic(row)" />
                  <i class="el-icon-view table-operation" style="color: #87d068;" @click="view(row)" />
                </template>
              </el-table-column>
            </el-table>
            <pagination
              v-show="total>0"
              :total="total"
              :page.sync="pagination.num"
              :limit.sync="pagination.size"
              @pagination="search"
            />
          </div>
          <warn-view
            v-show="!scoreIndexShow"
            ref="view"
            @close="warnClose"
          />
        </div>
      </el-col>
      <el-col v-if="statisticScore.paperName !== ''" :xs="24" :sm="10">
        <el-card shadow="never" class="box-card">
          <div slot="header">
            <span>{{ statisticScore.paperName }}</span>
          </div>
          <div class="view-item">
            <span>排名：</span>{{ statisticScore.rank }} / {{ statisticScore.scoreCount }}
          </div>
          <div class="view-item">
            <span>总人数：</span>{{ statisticScore.fullCount }}
          </div>
          <div class="view-item">
            <span>平均分：</span>{{ statisticScore.average }} 分
          </div>
          <div class="view-item">
            <span>最高分：</span>{{ statisticScore.max }} 分
          </div>
          <div class="view-item">
            <span>最低分：</span>{{ statisticScore.min }} 分
          </div>
        </el-card>
        <!-- 成绩分布 -->
        <pie-chart
          :id="`distributeScore`"
          :legend-data="resolveName(statisticScore.fraction)"
          :series-data="statisticScore.fraction"
          :title="`分数段分布`"
          :series-name="`成绩信息`"
        />
      </el-col>
    </el-row>
  </div>
</template>
<script>

import { statisticScore } from '@/api/exam/online/score'
import Pagination from '@/components/Pagination'
import WarnView from './View'
import PieChart from '@/components/Charts/PieChart'

export default {
  name: 'ScoreMange',
  components: { Pagination, WarnView, PieChart },
  filters: {
    statusFilter(status) {
      const map = {
        1: 'success',
        0: 'danger'
      }
      return map[status]
    },
    scoreFilter(score) {
      if (score < 60) {
        return 'danger'
      } else if (score >= 60 && score < 70) {
        return 'warning'
      } else if (score >= 70 && score < 80) {
        return 'info'
      } else if (score >= 80 && score < 90) {
        return 'primary'
      } else {
        return 'success'
      }
    }
  },
  data() {
    return {
      dialog: {
        isVisible: false,
        title: ''
      },
      warnViewClose: false,
      scoreIndexShow: true,
      tableKey: 0,
      loading: false,
      list: null,
      total: 0,
      queryParams: {},
      sort: {},
      terms: [],
      types: [],
      pagination: {
        size: 10,
        num: 1
      },
      statisticScore: {
        paperName: '',
        max: 0,
        min: 0,
        average: 0,
        fraction: [],
        rank: 0,
        scoreCount: 0,
        fullCount: 0
      }
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    }
  },
  mounted() {
    this.fetch()
    this.initTerms()
    this.initTypes()
  },
  methods: {
    initTerms() {
      this.$get('exam-basic/term/options').then((r) => {
        this.terms = r.data.data
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      this.loading = true
      this.$get('exam-online/score', {
        ...params
      }).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.list = data.rows
        this.loading = false
        if (this.list.length > 0) {
          this.statistic(this.list[0])
        }
      })
    },
    resolveName(list) {
      if (typeof list === 'object') {
        return list.map(function(res) {
          return res.name
        })
      }
    },
    initTypes() {
      this.$get('exam-basic/type/options').then((r) => {
        this.types = r.data.data
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    statistic(row) {
      statisticScore({ paperId: row.paperId }).then((r) => {
        const res = r.data.data
        this.statisticScore.paperName = row.paperName
        this.statisticScore.max = res.max
        this.statisticScore.min = res.min
        this.statisticScore.average = res.average
        this.statisticScore.fraction = res.fraction
        this.statisticScore.average = res.average
        this.statisticScore.fraction = res.fraction
        this.statisticScore.rank = res.rank
        this.statisticScore.scoreCount = res.scoreCount
        this.statisticScore.fullCount = res.fullCount
      })
    },
    view(row) {
      this.$get(`exam-online/answer/warn`, { paperId: row.paperId }).then((r) => {
        const warnAnswers = r.data.data
        const score = { ...row }
        this.$refs.view.setScore(score)
        this.$refs.view.setWarnAnswers(warnAnswers)
        this.$refs.view.setTypes(this.types)
        this.scoreIndexShow = false
        this.statistic(row)
      })
    },
    search() {
      this.fetch({
        ...this.queryParams,
        ...this.sort
      })
    },
    warnClose() {
      this.scoreIndexShow = true
    },
    reset() {
      this.queryParams = {}
      this.sort = {}
      this.$refs.table.clearSort()
      this.$refs.table.clearFilter()
      this.search()
    }
  }
}
</script>
<style lang="scss" scoped>
  .score {
    margin: 10px;
    .app-container {
      margin: 0 0 10px 0 !important;
    }
  }
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
