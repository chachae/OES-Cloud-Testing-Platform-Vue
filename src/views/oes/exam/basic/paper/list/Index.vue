<template>
  <div>
    <div v-show="paperIndexShow">
      <div class="filter-container">
        <el-input
          v-model="queryParams.paperName"
          :placeholder="$t('table.paper.paperName')"
          class="filter-item search-item"
        />
        <el-select
          v-model="queryParams.termId"
          :placeholder="$t('table.term.termName')"
          class="filter-item search-item"
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
        <el-button v-has-permission="['paper:delete']" class="filter-item" type="danger" @click="batchDelete">
          {{ $t('table.delete') }}
        </el-button>
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
          :label="$t('table.paper.paperName')"
          prop="paperName"
          :show-overflow-tooltip="true"
          align="center"
          min-width="90px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.paperName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('table.paper.courseName')"
          prop="paperName"
          :show-overflow-tooltip="true"
          align="center"
          min-width="90px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.courseName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('table.paper.type')"
          prop="type"
          :show-overflow-tooltip="true"
          align="center"
          min-width="50px"
        >
          <template slot-scope="scope">
            <el-tag :type=" scope.row.type | typeFilter ">
              {{ transType(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('table.paper.paperScore')"
          prop="paperScore"
          :show-overflow-tooltip="true"
          align="center"
          min-width="50px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.paperScore }} 分</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('table.paper.status')"
          prop="status"
          :show-overflow-tooltip="true"
          align="center"
          min-width="50px"
        >
          <template slot-scope="{row}">
            <el-switch
              v-model="row.status"
              :active-text="$t('common.active')"
              :inactive-text="$t('common.inactive')"
              :active-value="1"
              :inactive-value="0"
              :disabled="row.isStart"
              @change="updateStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('table.paper.minute')"
          prop="minute"
          :show-overflow-tooltip="true"
          align="center"
          min-width="50px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.minute }} 分钟</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('table.operation')"
          align="center"
          min-width="100px"
          class-name="small-padding fixed-width"
        >
          <template slot-scope="{row}">
            <i
              v-hasPermission="['paper:view']"
              class="el-icon-view table-operation"
              style="color: #87d068;"
              @click="view(row)"
            />
            <i
              v-hasPermission="['paper:update']"
              class="el-icon-setting table-operation"
              style="color: #2db7f5;"
              @click="edit(row)"
            />
            <i
              v-has-permission="['paper:delete']"
              class="el-icon-delete table-operation"
              style="color: #f50;"
              @click="singleDelete(row)"
            />
            <el-link v-has-no-permission="['paper:delete']" class="no-perm">
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
    </div>
    <!-- paper view -->
    <paper-view
      ref="view"
      :dialog-visible="dialog.isPaperViewVisible"
      @close="viewClose"
    />
    <!-- paper edit -->
    <paper-edit
      ref="edit"
      :dialog-visible="dialog.isEditVisible"
      :title="dialog.title"
      @success="editSuccess"
      @close="editClose"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import PaperView from './View'
import PaperEdit from './Edit'
import { update, del, page } from '@/api/exam/basic/paper'
export default {
  name: 'PaperList',
  components: { PaperEdit, Pagination, PaperView },
  filters: {
    typeFilter(type) {
      const map = {
        0: 'info',
        1: 'primary'
      }
      return map[type]
    }
  },
  props: {
    terms: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      dialog: {
        isPaperViewVisible: false,
        isEditVisible: false,
        title: ''
      },
      activeTab: null,
      tableKey: 0,
      paperViewShow: false,
      paperIndexShow: true,
      list: null,
      total: 0,
      queryParams: {},
      sort: {},
      selection: [],
      courses: [],
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
  },
  methods: {
    onSelectChange(selection) {
      this.selection = selection
    },
    edit(row) {
      const paper = { ...row }
      let deptIds = []
      if (row.deptIds && typeof row.deptIds === 'string') {
        deptIds = row.deptIds.split(',')
        paper.deptIds = deptIds
      }
      this.dialog.title = this.$t('common.edit')
      this.$refs.edit.setPaper(paper)
      this.dialog.isEditVisible = true
    },
    view(row) {
      const paper = { ...row }
      this.dialog.isPaperViewVisible = true
      this.paperIndexShow = false
      this.$refs.view.setPaper(paper)
    },
    editClose() {
      this.dialog.isEditVisible = false
    },
    editSuccess() {
      this.search()
    },
    transType(type) {
      return type === 1 ? this.$t('common.paperType.normal') : this.$t('common.paperType.imitate')
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      page(params).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.list = data.rows
      })
    },
    viewClose() {
      this.dialog.isPaperViewVisible = false
      this.paperIndexShow = true
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
        const paperIds = []
        this.selection.forEach((l) => {
          paperIds.push(l.paperId)
        })
        this.delete(paperIds)
      }).catch(() => {
        this.clearSelections()
      })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    delete(paperIds) {
      del(paperIds).then(() => {
        this.$message({
          message: this.$t('tips.deleteSuccess'),
          type: 'success'
        })
        this.search()
      })
    },
    updateStatus(row) {
      update({ paperId: row.paperId, status: row.status }).then(() => {
        this.$message({
          message: this.$t('tips.updateSuccess'),
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
    sortChange(val, a) {
      this.sort.field = val.prop
      this.sort.order = val.order
      this.search()
    }
  }
}
</script>

<style scoped>

</style>
