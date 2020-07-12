<template>
  <div class="app-container">
    <el-table
      border
      class="server-table"
      :data="server"
      style="width: 100%"
    >
      <el-table-column
        prop="name"
        label="服务名"
      />
      <el-table-column
        prop="port"
        label="端口"
      >
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.id % 2 === 0 ? 'primary' : 'success'"
            disable-transitions
          >
            {{ scope.row.port }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="description"
        label="描述"
      />
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'ServerTable',
  data() {
    return {
      server: [{
        id: 1,
        name: 'OES-Auth',
        port: '9200',
        description: '微服务认证服务器'
      },
      {
        id: 2,
        name: 'OES-Gateway',
        port: '8301',
        description: '微服务网关'
      },
      {
        id: 3,
        name: 'OES-Server-System',
        port: '9501',
        description: '微服务子系统，系统模块'
      },
      {
        id: 4,
        name: 'OES-Server-Demo',
        port: '9502',
        description: '微服务子系统，Demo模块'
      },
      {
        id: 5,
        name: 'OES-Server-Exam-Online',
        port: '9503',
        description: '微服务子系统，在线考试模块'
      },
      {
        id: 6,
        name: 'OES-Server-Exam-Basic',
        port: '9502',
        description: '微服务子系统，在线考试核心模块'
      },
      {
        id: 7,
        name: 'OES-OSS-QiNiu',
        port: '9700',
        description: '七牛云对象存储'
      },
      {
        id: 8,
        name: 'OES-Server-Job',
        port: '8204',
        description: '微服务子系统，任务调度模块'
      },
      {
        id: 9,
        name: 'OES-TX-Manager',
        port: '8501',
        description: '分布式事务控制中心'
      }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
