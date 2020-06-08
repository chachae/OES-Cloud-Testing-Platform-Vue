<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="queryParams.typeName"
        :placeholder="$t('table.type.typeName')"
        class="filter-item search-item"
      />
      <el-button class="filter-item" type="primary" plain @click="search">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" type="warning" plain @click="reset">
        {{ $t('table.reset') }}
      </el-button>
      <el-dropdown v-has-any-permission="['type:view','type:add','type:delete']" trigger="click" class="filter-item">
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['type:add']" @click.native="add">{{ $t('table.add') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['type:delete']" @click.native="batchDelete">{{ $t('table.delete') }}
          </el-dropdown-item>
          <el-dropdown-item v-has-permission="['type:export']" @click.native="exportExcel">{{ $t('table.export') }}
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
      @selection-change="onSelectChange"
      @sort-change="sortChange"
    >
      <el-table-column type="selection" align="center" width="40px" />
      <el-table-column
        :label="$t('table.type.typeId')"
        prop="typeId"
        :show-overflow-tooltip="true"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.typeId }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.type.typeName')"
        prop="typeName"
        :show-overflow-tooltip="true"
        align="center"
        min-width="120px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.type.score')"
        prop="score"
        :show-overflow-tooltip="true"
        align="center"
        min-width="100px"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.score === null ? 'info' : ''">
            {{ transScore(row.score) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.type.createTime')"
        prop="createTime"
        :show-overflow-tooltip="true"
        align="center"
        min-width="150px"
        sortable="custom"
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
          <i v-hasPermission="['type:update']" class="el-icon-setting table-operation" style="color: #2db7f5;" @click="edit(row)" />
          <i
            v-has-permission="['type:delete']"
            class="el-icon-delete table-operation"
            style="color: #f50;"
            @click="singleDelete(row)"
          />
          <el-link v-has-no-permission="['type:delete']" class="no-perm">
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
    <type-edit
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
import TypeEdit from './Edit'
export default {
  name: 'TypeMange',
  components: { Pagination, TypeEdit },
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
    onSelectChange(selection) {
      this.selection = selection
    },
    transScore(score) {
      return score !== null ? score + '分' : '无'
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
      this.$refs.edit.setType(row)
      this.dialog.title = this.$t('common.edit')
      this.dialog.isVisible = true
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      this.loading = true
      this.$get('examination/type', {
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
      const defaultTypeId = [1, 2, 3, 4, 5]
      let contain = false
      this.$confirm(this.$t('tips.confirmDelete'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        const typeIds = []
        this.selection.forEach((l) => {
          if (defaultTypeId.includes(l.typeId)) {
            contain = true
            return
          }
          typeIds.push(l.typeId)
        })
        if (contain) {
          this.$message({
            message: this.$t('tips.containDefaultTypeId'),
            type: 'warning'
          })
          this.clearSelections()
        } else {
          this.delete(typeIds)
        }
      }).catch(() => {
        this.clearSelections()
      })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    delete(typeIds) {
      this.loading = true
      this.$delete(`examination/type/${typeIds}`).then(() => {
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
    },
    transTime(time) {
      return `${time} ms`
    },
    sortChange(val, a) {
      this.sort.field = val.prop
      this.sort.order = val.order
      this.search()
    }
  }
}
</script>
