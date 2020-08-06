<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="queryParams.username"
        placeholder="学号"
        class="filter-item search-item"
      />
      <el-input
        v-model="queryParams.fullName"
        placeholder="姓名"
        class="filter-item search-item"
      />
      <el-input
        v-model="queryParams.paperName"
        placeholder="考试名称"
        class="filter-item search-item"
      />
      <el-select
        v-model="queryParams.termId"
        class="filter-item search-item"
        value=""
        placeholder="学期"
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
      <el-dropdown v-has-any-permission="['violatelog:view']" trigger="click" class="filter-item">
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['violatelog:delete']" @click.native="batchDelete">{{ $t('table.delete') }}</el-dropdown-item>
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
      @selection-change="onSelectChange"
    >
      <el-table-column type="selection" align="center" width="40px" />
      <el-table-column
        label="姓名"
        prop="fullName"
        :show-overflow-tooltip="true"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.fullName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="用户名"
        prop="username"
        :show-overflow-tooltip="true"
        align="center"
        min-width="120px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="违规考试"
        prop="paperName"
        :show-overflow-tooltip="true"
        align="center"
        min-width="150px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.paperName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="违规时间"
        prop="violateTime"
        :show-overflow-tooltip="true"
        align="center"
        min-width="150px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.violateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="停留时间"
        prop="violateTime"
        :show-overflow-tooltip="true"
        align="center"
        min-width="150px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.stayTime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.operation')"
        align="center"
        min-width="110px"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <i v-hasPermission="['violatelog:view']" class="el-icon-view table-operation" style="color: #2db7f5;" @click="view(row)" />
          <i
            v-has-permission="['violatelog:delete']"
            class="el-icon-delete table-operation"
            style="color: #f50;"
            @click="singleDelete(row)"
          />
          <el-link v-has-no-permission="['violatelog:delete']" class="no-perm">
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
    <!-- 查看 -->
    <violate-log-view
      ref="view"
      :dialog-visible="violateLogViewVisible"
      @close="viewClose"
    />
  </div>
</template>
<script>
import ViolateLogView from './View'
import Pagination from '@/components/Pagination'
import { pageLog, deleteLog } from '@/api/exam/basic/violateLog'
import { termOptions } from '@/api/exam/basic/term'
export default {
  name: 'TypeMange',
  components: { Pagination, ViolateLogView },
  filters: {
    timeFilter(time) {
      if (time < 500) {
        return 'success'
      } else if (time < 1000) {
        return ''
      } else if (time < 1500) {
        return 'warning'
      } else {
        return 'danger'
      }
    }
  },
  data() {
    return {
      dialog: {
        isVisible: false,
        title: ''
      },
      tableKey: 0,
      violateLogViewVisible: false,
      loading: false,
      list: null,
      total: 0,
      terms: [],
      queryParams: {},
      selection: [],
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
    onSelectChange(selection) {
      this.selection = selection
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      this.loading = true
      pageLog(params).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.list = data.rows
        this.loading = false
      })
    },
    initTerms() {
      termOptions().then((r) => {
        this.terms = r.data.data
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
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
        const violateIds = []
        this.selection.forEach((l) => {
          violateIds.push(l.violateId)
        })
        this.delete(violateIds)
      }).catch(() => {
        this.clearSelections()
      })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    viewClose() {
      this.violateLogViewVisible = false
    },
    view(row) {
      this.$refs.view.setViolateLog(row)
      this.violateLogViewVisible = true
    },
    delete(violateIds) {
      this.loading = true
      deleteLog(violateIds).then(() => {
        this.$message({
          message: this.$t('tips.deleteSuccess'),
          type: 'success'
        })
        this.search()
      })
    },
    search() {
      this.fetch({
        ...this.queryParams
      })
    },
    reset() {
      this.queryParams = {}
      this.$refs.table.clearFilter()
      this.search()
    }
  }
}
</script>
