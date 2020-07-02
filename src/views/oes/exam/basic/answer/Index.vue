<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="queryParams.studentName"
        :placeholder="$t('table.answer.studentName')"
        class="filter-item search-item"
      />
      <el-input
        v-model="queryParams.paperName"
        :placeholder="$t('table.paper.paperName')"
        class="filter-item search-item"
      />
      <el-input
        v-model="queryParams.deptName"
        :placeholder="$t('table.answer.deptName')"
        class="filter-item search-item"
      />
      <el-select
        v-model="queryParams.termId"
        class="filter-item search-item"
        value=""
        :placeholder="$t('table.answer.termName')"
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
        :placeholder="$t('table.answer.status')"
      >
        <el-option value="1" :label="$t('table.answer.correct')" />
        <el-option value="0" :label="$t('table.answer.notCorrect')" />
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
        :label="$t('table.answer.paperName')"
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
        :label="$t('table.answer.termName')"
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
        :label="$t('table.answer.questionName')"
        prop="questionName"
        :show-overflow-tooltip="true"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.questionName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.answer.studentName')"
        prop="studentName"
        :show-overflow-tooltip="true"
        align="center"
        min-width="80px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.studentName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.answer.status')"
        prop="status"
        :show-overflow-tooltip="true"
        align="center"
        min-width="80px"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status === 1 ? $t('table.answer.correct'): $t('table.answer.notCorrect') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.answer.answerContent')"
        prop="answerContent"
        :show-overflow-tooltip="true"
        align="center"
        min-width="80px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.answerContent }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.course.createTime')"
        prop="createTime"
        :show-overflow-tooltip="true"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.operation')"
        align="center"
        min-width="110px"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <i
            v-hasPermission="['answer:update']"
            class="el-icon-setting table-operation"
            style="color: #2db7f5;"
            @click="edit(row)"
          />
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
    <course-edit
      ref="edit"
      :dialog-visible="dialog.isVisible"
      :title="dialog.title"
      @success="editSuccess"
      @close="editClose"
    />
  </div>
</template>
<script>

import Pagination from '@/components/Pagination'
import CourseEdit from './Edit'

export default {
  name: 'AnswerMange',
  components: { Pagination, CourseEdit },
  filters: {
    statusFilter(status) {
      const map = {
        1: 'success',
        0: 'warning'
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
      tableKey: 0,
      userViewVisible: false,
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
    edit(row) {
      const answer = { ...row }
      this.$refs.edit.setAnswer(answer)
      this.dialog.title = this.$t('common.edit')
      this.dialog.isVisible = true
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      this.loading = true
      this.$get('exam-basic/answer', {
        ...params
      }).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.list = data.rows
        this.loading = false
      })
    },
    viewClose() {
      this.userViewVisible = false
    },
    editClose() {
      this.dialog.isVisible = false
    },
    editSuccess() {
      this.search()
    },
    singleDelete(row) {
      this.$refs.table.toggleRowSelection(row, true)
      this.batchDelete()
    },
    clearSelections() {
      this.$refs.table.clearSelection()
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
