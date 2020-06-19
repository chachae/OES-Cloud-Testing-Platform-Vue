<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="queryParams.termName"
        :placeholder="$t('table.term.termName')"
        class="filter-item search-item"
      />
      <el-button class="filter-item" type="primary" plain @click="search">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" type="warning" plain @click="reset">
        {{ $t('table.reset') }}
      </el-button>
      <el-dropdown
        v-has-any-permission="['term:view','term:add','term:delete']"
        trigger="click"
        class="filter-item"
      >
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['term:add']" @click.native="add">{{ $t('table.add') }}
          </el-dropdown-item>
          <el-dropdown-item v-has-permission="['term:delete']" @click.native="batchDelete">{{ $t('table.delete') }}
          </el-dropdown-item>
          <el-dropdown-item v-has-permission="['term:export']" @click.native="exportExcel">{{ $t('table.export') }}
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
      <el-table-column type="selection" align="center" width="40px" />
      <el-table-column
        :label="$t('table.term.termId')"
        prop="termId"
        :show-overflow-tooltip="true"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.termId }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.term.termName')"
        prop="termName"
        :show-overflow-tooltip="true"
        align="center"
        min-width="120px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.termName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.term.createTime')"
        prop="createTime"
        :show-overflow-tooltip="true"
        align="center"
        min-width="150px"
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
            v-hasPermission="['term:update']"
            class="el-icon-setting table-operation"
            style="color: #2db7f5;"
            @click="edit(row)"
          />
          <i
            v-has-permission="['term:delete']"
            class="el-icon-delete table-operation"
            style="color: #f50;"
            @click="singleDelete(row)"
          />
          <el-link v-has-no-permission="['term:delete']" class="no-perm">
            {{ $t('tips.noPermission') }}
          </el-link>
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
    <term-edit
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
import TermEdit from './Edit'

export default {
  name: 'TermMange',
  components: { Pagination, TermEdit },
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
      selection: [],
      pagination: {
        size: 10,
        num: 1
      }
    }
  },
  mounted() {
    this.fetch()
  },
  methods: {
    transScore(score) {
      return score + '分'
    },
    exportExcel() {
      this.$download('system/log/excel', {
        pageSize: this.pagination.size,
        pageNum: this.pagination.num,
        ...this.queryParams
      }, `log_${new Date().getTime()}.xlsx`)
    },
    add() {
      this.dialog.title = this.$t('common.add')
      this.dialog.isVisible = true
    },
    edit(row) {
      const term = { ...row }
      this.$refs.edit.setTerm(term)
      this.dialog.title = this.$t('common.edit')
      this.dialog.isVisible = true
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      this.loading = true
      this.$get('exam-basic/term', {
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
    batchDelete() {
      if (!this.selection.length) {
        this.$message({
          message: this.$t('tips.noDataSelected'),
          type: 'warning'
        })
        return
      }
      this.$confirm(this.$t('tips.confirmDelete'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        const termIds = []
        this.selection.forEach((l) => {
          termIds.push(l.termId)
        })
        this.delete(termIds)
        this.clearSelections()
      }).catch(() => {
        this.clearSelections()
      })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    delete(termId) {
      this.loading = true
      this.$delete(`exam-basic/term/${termId}`).then(() => {
        this.$message({
          message: this.$t('tips.deleteSuccess'),
          type: 'success'
        })
        this.search()
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
