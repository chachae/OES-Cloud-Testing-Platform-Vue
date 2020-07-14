<template>
  <div>
    <div class="filter-container">
      <el-input v-model="queryParams.key" placeholder="关键词" class="filter-item search-item" />
      <el-input v-model="queryParams.creatorName" placeholder="发布人" class="filter-item search-item" />
      <el-button class="filter-item" type="primary" @click="search">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" type="warning" @click="reset">
        {{ $t('table.reset') }}
      </el-button>
      <el-dropdown v-has-any-permission="['announce:delete']" trigger="click" class="filter-item">
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <!-- 工具条 -->
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['announce:delete']" @click.native="batchDelete">{{ $t('table.delete') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!-- 表单 -->
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
      <el-table-column label="公告标题" prop="username" :show-overflow-tooltip="true" align="center" min-width="120px">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发布人" :show-overflow-tooltip="true" align="center" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.creatorName }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        prop="status"
        :show-overflow-tooltip="true"
        align="center"
        min-width="130px"
      >
        <template slot-scope="{row}">
          <el-switch
            v-model="row.status"
            active-text="发布"
            inactive-text="草稿"
            :active-value="1"
            :inactive-value="0"
            @change="updateStatus(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" align="center" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.operation')" align="center" min-width="150px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <i v-hasPermission="['announce:view']" class="el-icon-view table-operation" style="color: #87d068;" @click="view(row)" />
          <i v-hasPermission="['announce:update']" class="el-icon-setting table-operation" style="color: #87d068;" @click="update(row)" />
          <i v-hasPermission="['announce:delete']" class="el-icon-delete table-operation" style="color: #f50;" @click="singleDelete(row)" />
          <el-link v-has-no-permission="['announce:view','announce:update','announce:delete']" class="no-perm">
            {{ $t('tips.noPermission') }}
          </el-link>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination v-show="total>0" :total="total" :page.sync="pagination.num" :limit.sync="pagination.size" @pagination="search" />
    <!-- 查看 -->
    <announce-view
      ref="view"
      :dialog-visible="announceViewVisible"
      @close="viewClose"
    />
  </div>
</template>

<script>
import AnnounceView from './View'
import Pagination from '@/components/Pagination'
export default {
  name: 'From',
  components: { Pagination, AnnounceView },
  data() {
    return {
      dialog: {
        isVisible: false,
        title: ''
      },
      announceViewVisible: false,
      tableKey: 0,
      loading: false,
      list: null,
      total: 0,
      queryParams: {},
      selection: [],
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
    viewClose() {
      this.announceViewVisible = false
    },
    editClose() {
      this.dialog.isVisible = false
    },
    editSuccess() {
      this.search()
    },
    onSelectChange(selection) {
      this.selection = selection
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
    },
    // 单个删除
    singleDelete(row) {
      this.$refs.table.toggleRowSelection(row, true)
      this.batchDelete()
    },
    // 批量删除
    batchDelete() {
      if (!this.selection.length) {
        this.$message({
          message: this.$t('tips.noDataSelected'),
          type: 'warning'
        })
        return
      }
      const contain = false
      this.$confirm(this.$t('tips.confirmDelete'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        const announceIds = []
        this.selection.forEach((u) => {
          announceIds.push(u.announceId)
        })
        if (contain) {
          this.$message({
            message: this.$t('tips.containCurrentUser'),
            type: 'warning'
          })
          this.clearSelections()
        } else {
          this.delete(announceIds)
        }
      }).catch(() => {
        this.clearSelections()
      })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    view(row) {
      this.$get(`system/announce/content/${row.contentId}`).then((r) => {
        const html = r.data.data
        this.$refs.view.setAnnounce(row)
        this.$refs.view.setContent(html)
      })
      this.announceViewVisible = true
    },
    update(row) {
      this.$get(`system/announce/content/${row.contentId}`).then((r) => {
        const content = r.data.data
        this.$emit('update', row, content)
      })
    },
    updateStatus(row) {
      this.$put(`system/announce/${row.announceId}`, { status: row.status }).then(() => {
        this.$message({
          message: this.$t('tips.updateSuccess'),
          type: 'success'
        })
        this.search()
      })
    },
    // 删除公告
    delete(announceIds) {
      this.loading = true
      this.$delete(`system/announce/${announceIds}`).then(() => {
        this.$message({
          message: this.$t('tips.deleteSuccess'),
          type: 'success'
        })
        this.search()
      })
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      this.loading = true
      this.$get('system/announce', { ...params }).then((r) => {
        const data = r.data.data
        this.total = data.total
        this.list = data.rows
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>

</style>
