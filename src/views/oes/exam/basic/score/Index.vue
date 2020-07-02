<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="queryParams.key"
        :placeholder="$t('table.score.key')"
        class="filter-item search-item"
      />
      <el-input
        v-model="queryParams.paperName"
        :placeholder="$t('table.paper.paperName')"
        class="filter-item search-item"
      />
      <el-input
        v-model="queryParams.deptName"
        :placeholder="$t('table.score.deptName')"
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
      <el-select
        v-model="queryParams.status"
        class="filter-item search-item"
        :placeholder="$t('table.score.status')"
      >
        <el-option value="1" :label="$t('table.score.ok')" />
        <el-option value="0" :label="$t('table.score.bad')" />
      </el-select>
      <el-button class="filter-item" type="primary" @click="search">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" type="warning" @click="reset">
        {{ $t('table.reset') }}
      </el-button>
      <el-dropdown
        v-has-any-permission="['score:view','score:add','score:delete']"
        trigger="click"
        class="filter-item"
      >
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['score:delete']">{{ $t('table.delete') }}
          </el-dropdown-item>
          <el-dropdown-item v-has-permission="['score:export']" @click.native="exportExcel">{{ $t('table.export') }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
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
        :label="$t('table.score.status')"
        prop="status"
        :show-overflow-tooltip="true"
        align="center"
        min-width="50px"
      >
        <template slot-scope="{row}">
          <el-switch
            v-model="row.status"
            :active-text="$t('table.score.ok')"
            :inactive-text="$t('table.score.bad')"
            :active-value="1"
            :inactive-value="0"
            @change="updateStatus(row)"
          />
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
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="pagination.num"
      :limit.sync="pagination.size"
      @pagination="search"
    />
  </div>
</template>
<script>

import Pagination from '@/components/Pagination'

export default {
  name: 'ScoreMange',
  components: { Pagination },
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
      tableKey: 0,
      loading: false,
      list: null,
      total: 0,
      queryParams: {},
      sort: {},
      terms: [],
      pagination: {
        size: 10,
        num: 1
      }
    }
  },
  mounted() {
    this.fetch()
    this.initTerms()
  },
  methods: {
    exportExcel() {
      this.$download('system/log/excel', {
        pageSize: this.pagination.size,
        pageNum: this.pagination.num,
        ...this.queryParams
      }, `log_${new Date().getTime()}.xlsx`)
    },
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
    updateStatus(row) {
      this.$put(`exam-basic/score`, { scoreId: row.scoreId, status: row.status }).then(() => {
        this.$message({
          message: this.$t('tips.updateSuccess'),
          type: 'success'
        })
        this.search()
      })
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      this.loading = true
      this.$get('exam-basic/score', {
        ...params
      }).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.list = data.rows
        this.loading = false
      })
    },
    search() {
      this.fetch({
        ...this.queryParams,
        ...this.sort
      })
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
