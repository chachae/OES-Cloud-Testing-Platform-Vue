<template>
  <div class="app-container">
    <div v-show="paperIndexShow">
      <div class="filter-container">
        <el-input
          v-model="queryParams.paperName"
          :placeholder="$t('table.paper.paperName')"
          class="filter-item search-item"
        />
        <el-button class="filter-item" type="primary" plain @click="search">
          {{ $t('table.search') }}
        </el-button>
        <el-button class="filter-item" type="warning" plain @click="reset">
          {{ $t('table.reset') }}
        </el-button>
        <el-dropdown
          v-has-any-permission="['paper:view','paper:add','question:paper']"
          trigger="click"
          class="filter-item"
        >
          <el-button>
            {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-has-permission="['paper:add']" @click.native="randomAdd">{{ $t('table.randomPaper') }}
            </el-dropdown-item>
            <el-dropdown-item v-has-permission="['paper:delete']" @click.native="batchDelete">{{ $t('table.delete') }}
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
              :disabled="row.isEnd"
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
              @click="randomAdd(row)"
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
      <paper-random-add
        ref="random"
        :dialog-visible="dialog.isVisible"
        :title="dialog.title"
        @success="editSuccess"
        @close="editClose"
      />
    </div>
    <!-- paper view -->
    <paper-view
      v-show="paperViewShow"
      ref="view"
      @close="viewClose"
    />
  </div>
</template>
<script>
import Pagination from '@/components/Pagination'
import PaperView from './View'
import PaperRandomAdd from './Random'

export default {
  name: 'QuestionMange',
  components: { PaperRandomAdd, Pagination, PaperView },
  filters: {
    typeFilter(type) {
      const map = {
        0: 'info',
        1: 'primary'
      }
      return map[type]
    }
  },
  data() {
    return {
      dialog: {
        isVisible: false,
        title: ''
      },
      tableKey: 0,
      paperViewShow: false,
      paperIndexShow: true,
      randomViewVisible: false,
      loading: false,
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
    this.initCourses()
    this.initTypes()
  },
  methods: {
    onSelectChange(selection) {
      this.selection = selection
    },
    randomAdd() {
      this.$refs.random.setCourses(this.courses)
      this.$refs.random.setTypes(this.types)
      this.dialog.title = this.$t('common.add')
      this.dialog.isVisible = true
    },
    add() {
      this.$refs.edit.setCourses(this.courses)
      this.dialog.title = this.$t('common.add')
      this.dialog.isVisible = true
    },
    view(row) {
      this.$refs.view.setPaper(row)
      this.$refs.view.setTypes(this.types)
      this.paperViewShow = true
      this.paperIndexShow = false
      console.log(row)
    },
    editClose() {
      this.dialog.isVisible = false
    },
    editSuccess() {
      this.search()
    },
    initCourses() {
      this.$get('examination/course/options').then((r) => {
        this.courses = r.data.data
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    initTypes() {
      this.$get('examination/type/options').then((r) => {
        this.types = r.data.data
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    transType(type) {
      return type === 1 ? this.$t('common.paperType.normal') : this.$t('common.paperType.imitate')
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      this.loading = true
      this.$get('examination/paper', {
        ...params
      }).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.list = data.rows
        this.loading = false
      })
    },
    viewClose() {
      this.paperViewShow = false
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
        const questionIds = []
        this.selection.forEach((l) => {
          questionIds.push(l.questionId)
        })
        this.delete(questionIds)
      }).catch(() => {
        this.clearSelections()
      })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    delete(questionIds) {
      this.loading = true
      this.$delete(`examination/question/${questionIds}`).then(() => {
        this.$message({
          message: this.$t('tips.deleteSuccess'),
          type: 'success'
        })
        this.search()
      })
    },
    updateStatus(row) {
      this.$put(`examination/paper`, { paperId: row.paperId, status: row.status }).then(() => {
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
