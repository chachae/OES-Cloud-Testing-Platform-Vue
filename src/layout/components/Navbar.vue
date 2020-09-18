<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <search id="header-search" class="right-menu-item" />
        <screenfull id="screenfull" class="right-menu-item hover-effect" />
      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar" alt="avatar">
          <span class="user-name">{{ username }}</span>
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/profile/index">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>
          <el-dropdown-item>
            <span style="display:block;" @click="setting">系统设置</span>
          </el-dropdown-item>
          <a target="_blank" href="https://github.com/chachae/oes-vue">
            <el-dropdown-item>项目地址</el-dropdown-item>
          </a>
          <div>
            <el-dropdown-item>
              <span style="display:block;" @click="aboutOes">关于系统</span>
            </el-dropdown-item>
          </div>
          <el-dropdown-item divided>
            <span style="display:block;" @click="deleteCache">清除缓存</span>
          </el-dropdown-item>
          <el-dropdown-item divided>
            <span style="display:block;" @click="logout">退出系统</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!-- 查看 -->
    <oes-info
      ref="view"
      :dialog-visible="oesInfoVisible"
      @close="viewClose"
    />
  </div>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import db from '@/utils/localstorage'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import Search from '@/components/HeaderSearch'
import OesInfo from './OesInfo'

export default {
  components: {
    Hamburger,
    Breadcrumb,
    Screenfull,
    Search,
    OesInfo
  },
  data() {
    return {
      oesInfoVisible: false
    }
  },
  computed: {
    sidebar() {
      return this.$store.state.setting.sidebar
    },
    avatar() {
      return require(`@/assets/avatar/${this.$store.state.account.user.avatar}`)
    },
    username() {
      return this.$store.state.account.user.fullName
    },
    device() {
      return this.$store.state.setting.device
    }
  },
  methods: {
    aboutOes() {
      this.oesInfoVisible = true
    },
    viewClose() {
      this.oesInfoVisible = false
    },
    toggleSideBar() {
      this.$store.commit('setting/toggleSidebar')
    },
    setting() {
      this.$store.commit('setting/openSettingBar', true)
    },
    logout() {
      this.clean()
    },
    clean() {
      db.clear()
      location.reload()
    },
    deleteCache() {
      this.$confirm(this.$t('tips.confirmDeleteCache'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        db.remove('USER_ROUTER')
        db.remove('PERMISSIONS')
        location.reload()
      }).catch(() => {
        // do nothing
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  border-bottom: 1px solid #f1f1f1;
  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 10px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;
        .user-name {
          vertical-align: top;
          font-size: .9rem;
          margin-left: 5px;
          margin-top: -4px;
          display: inline-block;
        }
        .user-avatar {
          cursor: pointer;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          vertical-align: text-bottom;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
