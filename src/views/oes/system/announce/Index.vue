<template>
  <div class="app-container">
    <div>
      <el-row :gutter="10">
        <el-col :xs="24" :sm="24">
          <el-tabs v-model="activeTab" v-has-any-permission="['announce:view','announce:add']">
            <el-tab-pane label="公告列表" name="announce">
              <announce-form ref="announce" />
            </el-tab-pane>
            <el-tab-pane label="新增公告" name="add">
              <add-announce v-has-permission="['announce:add']" :user="currentUser" @success="addSuccess" />
              <el-link v-has-no-permission="['announce:add']" class="no-perm">
                {{ $t('tips.noPermission') }}
              </el-link>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import AnnounceForm from './Form'
import AddAnnounce from './Add'
export default {
  name: 'AnnounceManage',
  components: { AnnounceForm, AddAnnounce },
  data() {
    return {
      activeTab: '',
      dialog: {
        isVisible: false
      },
      loading: false
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    }
  },
  created() {
    this.activeTab = 'announce'
  },
  methods: {
    addSuccess() {
      this.$refs.announce.search()
      this.activeTab = 'announce'
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
