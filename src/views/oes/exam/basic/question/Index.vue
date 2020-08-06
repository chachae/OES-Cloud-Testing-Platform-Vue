<template>
  <div class="app-container">
    <div
      class="warning custom-block"
      style="margin: 0 0 1.2rem 0"
    >
      <p class="custom-block-title">WARNING</p>
      <p>
        <strong>注意事项：</strong>请各位老师或平台管理员，务必对试题信息进行严格保密，切勿在考试前泄露试题内容！️️
      </p>
    </div>
    <div class="filter-container">
      <el-input
        v-model="queryParams.questionName"
        :placeholder="$t('table.question.questionName')"
        class="filter-item search-item"
      />
      <el-select
        v-model="queryParams.courseId"
        class="filter-item search-item"
        value=""
        :placeholder="$t('table.course.courseName')"
      >
        <el-option
          v-for="item in courses"
          :key="item.courseId"
          :label="item.courseName"
          :value="item.courseId"
        />
      </el-select>
      <el-select
        v-model="queryParams.typeId"
        class="filter-item search-item"
        value=""
        :placeholder="$t('table.question.typeName')"
      >
        <el-option
          v-for="item in types"
          :key="item.typeId"
          :label="item.typeName"
          :value="item.typeId"
        />
      </el-select>
      <el-button class="filter-item" type="primary" @click="search">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" type="warning" @click="reset">
        {{ $t('table.reset') }}
      </el-button>
      <el-dropdown v-has-any-permission="['question:view','question:add','question:delete']" trigger="click" class="filter-item">
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['question:add']" @click.native="add">{{ $t('table.add') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['question:delete']" @click.native="batchDelete">{{ $t('table.delete') }}
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
        :label="$t('table.question.questionId')"
        prop="questionId"
        align="center"
        min-width="60px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.questionId }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.question.questionName')"
        prop="questionName"
        :show-overflow-tooltip="true"
        align="center"
        min-width="120px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.questionName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.question.courseName')"
        prop="courseName"
        :show-overflow-tooltip="true"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.courseName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.question.typeName')"
        prop="typeName"
        :show-overflow-tooltip="true"
        align="center"
        min-width="80px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.question.fullName')"
        prop="creatorName"
        :show-overflow-tooltip="true"
        align="center"
        min-width="80px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.creatorName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.question.difficult')"
        prop="difficult"
        :show-overflow-tooltip="true"
        align="center"
        min-width="50px"
      >
        <template slot-scope="{row}">
          <el-rate
            v-model="row.difficult"
            disabled
            :show-score="false"
            text-color="#ff9900"
            :max="3"
          />
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('table.operation')"
        align="center"
        min-width="110px"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <i v-hasPermission="['question:view']" class="el-icon-view table-operation" style="color: #87d068;" @click="view(row)" />
          <i
            v-hasPermission="['question:update']"
            class="el-icon-setting table-operation"
            style="color: #2db7f5;"
            @click="edit(row)"
          />
          <i
            v-if="row.creatorId === currentUser.userId"
            v-has-permission="['question:delete']"
            class="el-icon-delete table-operation"
            style="color: #f50;"
            @click="singleDelete(row)"
          />
          <el-link v-has-no-permission="['question:delete']" class="no-perm">
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
    <question-view
      ref="view"
      :dialog-visible="questionViewVisible"
      @close="viewClose"
    />
    <question-edit
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
import QuestionView from './View'
import QuestionEdit from './Edit'

export default {
  name: 'QuestionMange',
  components: { Pagination, QuestionView, QuestionEdit },
  data() {
    return {
      dialog: {
        isVisible: false,
        title: ''
      },
      tableKey: 0,
      questionViewVisible: false,
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
    add() {
      this.$refs.edit.setCourses(this.courses)
      this.$refs.edit.setTypes(this.types)
      this.dialog.title = this.$t('common.add')
      this.dialog.isVisible = true
    },
    view(row) {
      this.$refs.view.setQuestion(row)
      this.questionViewVisible = true
    },
    edit(row) {
      this.$refs.edit.setQuestion(row)
      this.$refs.edit.setCourses(this.courses)
      this.$refs.edit.setTypes(this.types)
      this.dialog.title = this.$t('common.edit')
      this.dialog.isVisible = true
    },
    initCourses() {
      this.$get('exam-basic/course/options').then((r) => {
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
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      this.loading = true
      this.$get('exam-basic/question', {
        ...params
      }).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.list = data.rows
        this.loading = false
      })
    },
    viewClose() {
      this.questionViewVisible = false
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
      this.$delete(`exam-basic/question/${questionIds}`).then(() => {
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
