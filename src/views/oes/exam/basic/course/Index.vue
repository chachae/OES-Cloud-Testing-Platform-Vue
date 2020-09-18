<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="queryParams.courseName"
        :placeholder="$t('table.course.courseName')"
        class="filter-item search-item"
      />
      <el-select
        v-model="queryParams.deptId"
        class="filter-item search-item"
        value=""
        :placeholder="$t('table.course.deptName')"
      >
        <el-option
          v-for="item in depts"
          :key="item.deptId"
          :label="item.deptName"
          :value="item.deptId"
        />
      </el-select>
      <el-button class="filter-item" type="primary" @click="search">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" type="warning" @click="reset">
        {{ $t('table.reset') }}
      </el-button>
      <el-dropdown
        v-has-any-permission="['course:view','course:add','course:delete']"
        trigger="click"
        class="filter-item"
      >
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['course:add']" @click.native="add">{{ $t('table.add') }}
          </el-dropdown-item>
          <el-dropdown-item v-has-permission="['course:delete']" @click.native="batchDelete">{{ $t('table.delete') }}
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
        :label="$t('table.course.courseId')"
        prop="courseId"
        :show-overflow-tooltip="true"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.courseId }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.course.courseName')"
        prop="courseName"
        :show-overflow-tooltip="true"
        align="center"
        min-width="120px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.courseName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.course.createTime')"
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
          <i
            v-hasPermission="['course:update']"
            class="el-icon-setting table-operation"
            style="color: #2db7f5;"
            @click="edit(row)"
          />
          <i
            v-has-permission="['course:delete']"
            class="el-icon-delete table-operation"
            style="color: #f50;"
            @click="singleDelete(row)"
          />
          <el-link
            v-has-no-permission="['course:delete']"
            class="no-perm"
          >
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
import { deptOptions } from '@/api/system/dept'
import { page, del } from '@/api/exam/basic/course'

export default {
  name: 'CourseMange',
  components: { Pagination, CourseEdit },
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
      depts: [],
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
    this.initDept()
  },
  methods: {
    onSelectChange(selection) {
      this.selection = selection
    },
    initDept() {
      deptOptions({ parentId: 0 }).then((r) => {
        this.depts = r.data.data
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    add() {
      this.$refs.edit.setDepts(this.depts)
      this.dialog.title = this.$t('common.add')
      this.dialog.isVisible = true
    },
    edit(row) {
      const course = { ...row }
      let teacherIds = []
      if (row.teacherIds && typeof row.teacherIds === 'string') {
        teacherIds = row.teacherIds.split(',')
        course.teacherIds = teacherIds
      }
      this.$refs.edit.setDepts(this.depts)
      this.$refs.edit.setCourse(course)
      this.dialog.title = this.$t('common.edit')
      this.dialog.isVisible = true
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      this.loading = true
      page({ ...params }).then((r) => {
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
        const courseIds = []
        this.selection.forEach((l) => {
          courseIds.push(l.courseId)
        })
        this.delete(courseIds)
        this.clearSelections()
      }).catch(() => {
        this.clearSelections()
      })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    delete(courseId) {
      this.loading = true
      del(courseId).then(() => {
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
    sortChange(val, a) {
      this.sort.field = val.prop
      this.sort.order = val.order
      this.search()
    }
  }
}
</script>
