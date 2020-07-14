<template>
  <div class="app-container">
    <div>
      <el-row :gutter="10">
        <el-col :xs="24" :sm="24">
          <el-tabs v-model="activeTab" v-has-any-permission="['announce:view','announce:add']" @tab-click="handleClick">
            <el-tab-pane label="公告列表" name="announce">
              <announce-form ref="announce" @update="update" />
            </el-tab-pane>
            <el-tab-pane label="新增公告" name="addOrUpdate">
              <add-announce
                ref="add"
                v-has-permission="['announce:add']"
                :user="currentUser"
                :announce="announce"
                @success="addSuccess"
              />
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
      loading: false,
      announce: {}
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
    handleClick(tab, event) {
      if (tab.name === 'addOrUpdate') {
        this.$refs.add.reset()
      }
    },
    addSuccess() {
      this.$refs.announce.search()
      this.activeTab = 'announce'
    },
    update(announce, content) {
      this.$refs.add.setAnnounce(announce)
      this.$refs.add.setContent(content)
      this.activeTab = 'addOrUpdate'
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
