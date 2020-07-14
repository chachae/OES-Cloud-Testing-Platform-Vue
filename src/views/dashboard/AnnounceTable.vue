<template>
  <div class="app-container">
    <el-table
      border
      class="server-table"
      :data="announce.list"
      style="width: 100%"
    >
      <el-table-column
        prop="title"
        label="公告标题"
      />
      <el-table-column
        prop="createTime"
        label="发布时间"
      />
      <el-table-column
        :label="$t('table.operation')"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row}">
          <i class="el-icon-view table-operation" style="color: #87d068;" @click="view(row)" />
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination
      v-show="announce.total>0"
      small
      layout="total, prev, pager, next"
      :total="announce.total"
      :page.sync="pagination.num"
      :limit.sync="pagination.size"
      @pagination="searchAnnounce"
    />
    <!-- 查看 -->
    <announce-view
      ref="view"
      :dialog-visible="announceViewVisible"
      @close="viewClose"
    />
  </div>
</template>

<script>
import { getContent, pageActive } from '@/api/system/announce'
import AnnounceView from './AnnounceView'
import Pagination from '@/components/Pagination'
export default {
  name: 'AnnounceTable',
  components: { AnnounceView, Pagination },
  data() {
    return {
      announceViewVisible: false,
      pagination: {
        size: 10,
        num: 1
      },
      queryParams: {},
      announce: {
        list: [],
        total: 0
      }
    }
  },
  mounted() {
    this.initAnnounce()
  },
  methods: {
    viewClose() {
      this.announceViewVisible = false
    },
    searchAnnounce() {
      this.initAnnounce({
        ...this.queryParams
      })
    },
    view(row) {
      getContent(row.contentId).then((r) => {
        const html = r.data.data
        this.$refs.view.setAnnounce(row)
        this.$refs.view.setContent(html)
      })
      this.announceViewVisible = true
    },
    initAnnounce(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      this.loading = true
      pageActive(params).then((r) => {
        const data = r.data.data
        this.announce.total = data.total
        this.announce.list = data.rows
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
