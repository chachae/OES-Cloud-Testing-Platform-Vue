<template>
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
          <template slot-scope="scope">
            <span>{{ scope.row.studentScore }} 分</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('table.operation')"
          align="center"
          min-width="110px"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{row}">
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
</template>
<script>

import Pagination from '@/components/Pagination'
import WarnView from './View'

export default {
  name: 'ScoreMange',
  components: { Pagination, WarnView },
  filters: {
    statusFilter(status) {
      const map = {
        1: 'success',
        0: 'danger'
      }
      return map[status]
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
      })
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
    view(row) {
      this.$get(`exam-online/answer/warn/${row.paperId}`,
        { studentId: this.currentUser.userId }).then((r) => {
        const warnAnswers = r.data.data
        const score = { ...row }
        this.$refs.view.setScore(score)
        this.$refs.view.setWarnAnswers(warnAnswers)
        this.$refs.view.setTypes(this.types)
        this.scoreIndexShow = false
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
