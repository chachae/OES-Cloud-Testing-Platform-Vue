<template>
  <div class="monitor">
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="app-container">
          <div class="filter-container">
            <el-input v-model="paperId" placeholder="考试编号" class="filter-item search-item" />
            <el-button class="filter-item" type="primary" @click="search">
              {{ $t('table.search') }}
            </el-button>
          </div>

          <div class="tip custom-block" style="margin: 0 0 1.2rem 0">
            <p>
              该服务为本在线考试平台的远程反作弊监控系统
            </p>
            <blockquote>
              <p>
                1. 基于 <strong>Netty 4</strong> 与 <strong>Redis</strong> 开发的高性能分布式 WebSocket 网络通信服务<br>
                2. 使用 <strong>WebRTC</strong> 技术实现秒级低延时直播能力，「淘宝直播」即使用该技术实现<br>
                3. 基于令牌服务器资源认证，https 安全协议，保证直播数据信号传输的私密性和安全性<br>
                4. 已知在4核8G服务器上有超强的表现能力，具备极强的高并发处理能力<br>
                5. 通过 JMeter 连接压测，单机部署下，可同时稳定承载 <strong>500,000+</strong> 空连接<br>
                6. 请在现代化浏览器（Chrome，Firefox）上使用本服务
              </p>
            </blockquote>
          </div>

          <el-table
            v-show="onlineUser"
            ref="table"
            :key="tableKey"
            :data="onlineUser"
            border
            fit
            style="width: 100%;"
          >
            <el-table-column label="用户名" prop="username" :show-overflow-tooltip="true" align="center" min-width="100px">
              <template slot-scope="scope">
                <span>{{ scope.row.username }}</span>
              </template>
            </el-table-column>
            <el-table-column label="真实姓名" prop="fullName" :show-overflow-tooltip="true" align="center" min-width="200px">
              <template slot-scope="scope">
                <span>{{ scope.row.fullName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="监控操作" align="center" width="150px" class-name="small-padding fixed-width">
              <template slot-scope="{row}">
                <el-tooltip class="item" effect="dark" content="屏幕监控" placement="top-start" :enterable="false">
                  <i class="el-icon-camera-solid table-operation" style="color: #2db7f5;" @click="monitorScreen(row)" />
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="摄像头监控" placement="top-start" :enterable="false">
                  <i class="el-icon-video-camera table-operation" style="color: #f5cd2d;" @click="monitorCamera(row)" />
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="发送消息" placement="top-start" :enterable="false">
                  <i class="el-icon-s-promotion table-operation" style="color: #8e2df5;" @click="sendMessage(row)" />
                </el-tooltip>
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
      </el-col>
      <el-col :xs="24" :sm="12">
        <div v-show="remoteStream.video" class="app-container">
          <div class="filter-container">
            <el-button type="primary" plain @click="fullScreen">全屏</el-button>
          </div>
          <video
            id="remoteVideo"
            width="100%"
            height="100%"
            autoplay="autoplay"
            muted
          />
        </div>
      </el-col>
    </el-row>
    <send-message
      ref="sendMessage"
      :dialog-visible="dialog.isVisible"
      @close="dialogClose"
    />
  </div>
</template>
<script>

import { getExam } from '@/api/exam/online/monitor'
import { connectSocket } from '@/utils/socket'
import Pagination from '@/components/Pagination'
import { sendOne } from '@/api/exam/online/socket'
import sendMessage from './Message'

export default {
  name: 'ExamMonitor',
  components: { Pagination, sendMessage },
  data() {
    return {
      dialog: {
        isVisible: false,
        title: ''
      },
      paperId: null,
      tableKey: 0,
      paperListShow: true,
      examDetailShow: false,
      loading: false,
      normalPaper: [],
      imitatePaper: [],
      websocket: null,
      onlineUser: [],
      pagination: {
        size: 10,
        num: 1
      },
      queryParams: {},
      total: 0,
      remoteStream: {
        video: false
      },
      hasSubmit: false,
      myPeerConnection: null,
      // PeerConnection 初始化标记
      RTCPeerConnectionCreated: false,
      // 信令服务器配置
      configuration: {
        iceServers: [{
          'urls': 'stun:stun.l.google.com:19302'
        }, {
          'urls': 'turn:127.0.0.1:3478',
          'username': '123456',
          'credential': '123456'
        }]
      },
      // 被监控人用户名
      monitorUsername: null,
      monitorFullName: null
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    }
  },
  mounted() {
  },
  methods: {

    connectSocket() {
      this.websocket = connectSocket(this.websocket, this.currentUser.username, this.currentUser.fullName, null)
      this.websocket.onopen = () => {
      }
      this.websocket.onclose = () => {
        console.log('Connection closed.')
      }
      this.websocket.onerror = () => {
        console.log('websocket error')
      }
      this.websocket.onmessage = this.handleMessage
    },

    search() {
      if (this.paperId !== null) {
        if (this.websocket === null) {
          this.connectSocket()
        }
        this.queryParams.pageNum = this.pagination.num
        this.queryParams.pageSize = this.pagination.size
        this.queryParams.paperId = this.paperId
        getExam({ ...this.queryParams }).then((r) => {
          const data = r.data.data
          this.onlineUser = data.rows
          this.total = data.total
        })
      }
    },

    dialogClose() {
      this.dialog.isVisible = false
    },

    reset() {
      this.queryParams = {}
    },

    // video
    // 全屏
    Screen(element) {
      if (element.requestFullscreen) {
        element.requestFullscreen()
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen()
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen()
      } else if (element.oRequestFullscreen) {
        element.oRequestFullscreen()
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullScreen()
      } else {
        const docHtml = document.documentElement
        const docBody = document.body
        const videobox = document.getElementById('remoteVideo')
        const cssText = 'width:100%;height:100%;overflow:hidden;'
        docHtml.style.cssText = cssText
        docBody.style.cssText = cssText
        videobox.style.cssText = cssText + ';' + 'margin:0px;padding:0px;'
        document.IsFullScreen = true
      }
    },

    fullScreen() {
      const element = document.getElementById('remoteVideo')
      this.Screen(element)
    },

    // WebRTC

    /** *
     * 监控命令
     */
    monitorCamera(row) {
      this.remoteStream.video = false
      this.initWebRTCParam()
      this.initPeer()
      this.hasSubmit = true
      this.monitorUsername = row.username
      this.monitorFullName = row.fullName
      sendOne(JSON.stringify({
        command: 'cmd',
        fromId: this.currentUser.username,
        toId: this.monitorUsername,
        content: 'camera'
      }))
    },

    sendMessage(row) {
      this.$refs.sendMessage.setInfo(this.currentUser.username, row.username)
      this.dialog.isVisible = true
    },

    monitorScreen(row) {
      this.remoteStream.video = false
      this.initWebRTCParam()
      this.initPeer()
      this.hasSubmit = true
      this.monitorUsername = row.username
      this.monitorFullName = row.fullName
      sendOne(JSON.stringify({
        command: 'cmd',
        fromId: this.currentUser.username,
        toId: this.monitorUsername,
        content: 'screen'
      }))
    },

    initWebRTCParam() {
      this.myPeerConnection = null
      this.myPeerConnection = null
      this.RTCPeerConnectionCreated = false
    },

    /** *
     * 初始化 RTCPeerConnection
     */
    initPeer() {
      this.myPeerConnection = new RTCPeerConnection(this.configuration)
      // 添加事件监听函数
      this.myPeerConnection.onicecandidate = this.handleIceCandidate
      this.myPeerConnection.ontrack = this.handleOnTrack
      this.RTCPeerConnectionCreated = true
    },

    /** *
     *处理candidate
     */
    handleCandidate(message) {
      const candidate = JSON.parse(message.content).candidate
      this.myPeerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch((e) => {
        console.log(e)
      })
    },

    /** *
     * 处理iceCandidate
     */
    handleIceCandidate(event) {
      if (event.candidate) {
        sendOne(JSON.stringify({
          command: 'candidate',
          fromId: this.currentUser.username,
          toId: this.monitorUsername,
          content: { candidate: event.candidate }
        }))
      }
    },

    /** *
     * 处理track
     */
    handleOnTrack(event) {
      this.remoteStream.video = true
      const remoteMediaStream = event.streams[0]
      const remoteVideo = document.getElementById('remoteVideo')
      try {
        remoteVideo.srcObject = remoteMediaStream
        remoteVideo.play()
      } catch (e) {
        // nothing to do
      }
    },

    /** *
     * 处理offer
     */
    handleOffer(message) {
      if (this.RTCPeerConnectionCreated === false) {
        this.initPeer()
      }
      const sdpMessage = message.content
      const sdp = JSON.parse(sdpMessage).sdp
      this.myPeerConnection.setRemoteDescription(new RTCSessionDescription(sdp))
      this.myPeerConnection.createAnswer().then(this.setLocalAndAnswer)
        .catch((e) => {
          console.log(e)
        }
        )
    },

    /** *
     * 处理answer
     */
    handleAnswer(message) {
      const sdp = JSON.parse(message.content).sdp
      this.myPeerConnection.setRemoteDescription(new RTCSessionDescription(sdp))
    },

    /** *
     * 处理 offer 并 answer
     */
    setLocalAndAnswer(sessionDescription) {
      this.myPeerConnection.setLocalDescription(sessionDescription)
      sendOne(JSON.stringify({
        command: 'answer',
        fromId: this.currentUser.username,
        toId: this.monitorUsername,
        content: { sdp: sessionDescription }
      }))
    },

    /** *
     * 心跳
     */
    checkHeart() {
      sendOne(JSON.stringify({
        command: 'heart',
        fromId: this.currentUser.username,
        toId: this.currentUser.username,
        content: 'ok'
      }))
    },

    /** *
     * 消息处理器
     */
    handleMessage(event) {
      const message = JSON.parse(event.data)
      switch (message.command) {
        case 'offer':
          this.handleOffer(message)
          break
        case 'candidate':
          this.handleCandidate(message)
          break
        case 'answer':
          this.handleAnswer(message)
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .view-item {
    margin: 7px;
    i {
      font-size: .120rem;
      color: #E6A23C;
    }
    span {
      margin-left: 5px;
    }
  }

  .monitor {
    margin: 10px;
    .app-container {
      margin: 0 0 10px 0 !important;
    }
  }
  .el-card.is-always-shadow {
    box-shadow: none;
  }
  .el-card {
    border-radius: 0;
    border: none;
    .el-card__header {
      padding: 10px 20px !important;
      border-bottom: 1px solid #f1f1f1 !important;
    }
  }
</style>
