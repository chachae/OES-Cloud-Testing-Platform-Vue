<!-- 考试验证 -->
<template>
  <div>
    <div
      class="warning custom-block"
      style="margin: 0 0 1.2rem 0"
    >
      <p class="custom-block-title">WARNING</p>
      <p>期末考试将至，为创造诚信、公平、公正的考试环境，我班全体同学承诺如下：</p>
      <blockquote>
        <p>
          <i>
            一、主动自愿签订诚信考试承诺书，严格遵照承诺书上承诺去准备每一场考试，杜绝考试作弊行为，做诚实守信的学生<br>
            二、正确认识考试对评价自己的重要性。充分利用个人时间，认真复习，满怀信心地迎接考试<br>
            三、严格按照学院《考试规则》认真复习每一门功课，精心准备每一场考试，考出自己真实水平。做到我班期末考试“零作弊、零违纪”<br>
            四、尊重每一位监考老师，严格遵守考试、考场规则，杜绝一切考试作弊行为<br>
            五、树立与不良风气作斗争的勇气和决心，敢于检举揭发考试作弊行为<br>
            六、为了确保考生考试过程的行为可被监控同时保证数据传递安全性，本考试平台的远程数据采集与共享使用高级加密传输、WebRTC 和 安全目标 https 通道，具有极高的安全性<br>
            七、在考试设定相关数据监控、采集指令的情况下（若无，可直接忽略），请将考试设备摄像头、屏幕共享、数据共享等权限,根据如下步骤条引导，完成检查和设置<br>
            八、若违反考试相关约定，拒绝配合提示设置后进行考试或在考试过程中考生行为不可控、通过非常规手段阻断连接、丢失监控信号，监考人员有权远程将该考生成绩作废，并且在没有有效证明情况下，考生无法再次进行考试，望三思<br>
            九、当考生使用本平台进行考试时，则默认考生允许本平台持有考生考试设备的相关数据采集权限和数据共享权限，若不允许，请根据学校相关规定更换平台或进行线下考试
          </i>
        </p>
      </blockquote>
      <p>
        请考生仔细阅读以上约定，进入考试后默认考生同意以上的全部约定
      </p>
    </div>

    <div style="margin-top: 10px; margin-bottom: 20px" class="view-item">
      <div class="app-container">
        <el-steps :active="stepNum" finish-status="success" align-center>
          <el-step
            title="步骤 1"
            description="点击「检测设备」进行考前考试设备可用性检测"
          />
          <el-step
            title="步骤 2"
            description="点击「人脸卡证对比匹配」进行考生身份核验，如果浏览器提示本站需使用摄像头，请选择「允许」后继续下一步"
          />
          <el-step
            title="步骤 3"
            description="点击「设备监控与共享」进行数据共享，当弹出屏幕共享时，请选中整个屏幕后选择「允许」，当有摄像头使用权限提示时，请「允许」浏览器调用设备摄像头，注意：此处拒绝后进入考试，将视作严重违反考试规定，监考员有权作废考生成绩"
          />
        </el-steps>
      </div>
    </div>
    <div class="view-item" style="text-align: center">
      <el-button class="filter-item" :disabled="stepNum !== 0" type="primary" plain @click="deviceCheck">检测设备</el-button>
      <el-button class="filter-item" :disabled="stepNum !== 1" type="primary" plain @click="tracking">人脸卡证对比匹配</el-button>
      <el-button class="filter-item" :disabled="stepNum !== 2" type="primary" plain @click="connectDevices">设备监控与共享</el-button>
      <!--      <el-button v-if="stepNum === 3" class="filter-item" type="success" plain @click="enterExam">进入考试</el-button>-->
      <!-- todo 便于测试！！ -->
      <el-button class="filter-item" type="success" plain @click="enterExam">进入考试</el-button>
    </div>
    <!-- 人脸识别 -->
    <Tracking
      ref="tracking"
      :dialog-visible="dialog.isTrackingVisible"
      @close="trackingClose"
      @success="trackingSuccess"
    />
  </div>
</template>

<script>
import { openCamera } from '@/utils/camera'
import Tracking from '@/components/Tracking'
import { connectSocket } from '@/utils/socket'
import { sendOne } from '@/api/exam/online/socket'
export default {
  name: 'Validate',
  components: { Tracking },
  props: {
    active: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      stepNum: this.active,
      queryInfo: {},
      // websocket
      websocket: null,
      // 本地视频流
      localMediaStream: null,
      // 本地屏幕共享流
      localScreenStream: null,
      dialog: {
        isTrackingVisible: false
      },
      // 摄像头监控配置
      mediaConstraints: {
        video: true,
        audio: false
      },
      // 屏幕共享配置
      screenConstraints: {
        video: {
          cursor: 'always' | 'motion' | 'never',
          displaySurface: 'application' | 'browser' | 'monitor' | 'window'
        }
      },
      // 信令/信使服务器配置
      configuration: {
        iceServers: [{
          'urls': 'stun:stun.l.google.com:19302'
        }, {
          'urls': 'turn:106.15.202.13:3478',
          'username': 'chachae',
          'credential': '123456'
        }]
      },
      offerOptions: {
        iceRestart: true,
        offerToReceiveAudio: false,
        offerToReceiveVideo: true
      },
      rtcPeerConnection: null,
      cmdUser: null
    }
  },

  methods: {
    enterExam() {
      this.$emit('validateOk')
    },
    fetchValidate(info) {
      this.queryInfo = info
    },
    // 检测平台监控设备
    deviceCheck() {
      if (openCamera() === null) {
        this.$message({
          message: '系统摄像头不可用',
          type: 'error'
        })
      } else {
        this.$message({
          message: '摄像头检测通过',
          type: 'success'
        })
        this.stepNum++
      }
    },
    // 打开人脸匹配模态框
    tracking() {
      this.dialog.type = 'tracking'
      this.dialog.isTrackingVisible = true
      this.$refs.tracking.resetTracking()
    },
    // 关闭人脸匹配
    trackingClose() {
      this.dialog.isTrackingVisible = false
    },
    // 人脸匹配成功处理
    trackingSuccess() {
      this.stepNum++
      this.dialog.isTrackingVisible = false
    },
    // 建立远程设备监控环境
    connectDevices() {
      // 打开本地音视频,用promise这样在打开视频成功后，再进行下一步操作
      return new Promise((resolve, reject) => {
        // 摄像头
        navigator.mediaDevices.getUserMedia(this.mediaConstraints)
          .then((stream) => {
            this.localMediaStream = stream
          })
          .then(() => console.log('打开本地音视频设备成功'))
          .catch(() => console.log('打开本地音视频设备失败'))
        // 屏幕共享
        navigator.mediaDevices.getDisplayMedia(this.screenConstraints)
          .then((stream) => {
            this.localScreenStream = stream
          })
          .then(() => console.log('打开本地音视频设备成功'))
          .catch(() => console.log('打开本地音视频设备失败'))
        this.connectSocket()
        this.stepNum++
      })
    },
    // 连接websocket
    connectSocket() {
      this.websocket = connectSocket(this.websocket, this.queryInfo.username, this.queryInfo.fullName, this.queryInfo.paperId)
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
    // websocket 处理
    handleMessage(event) {
      const message = JSON.parse(event.data)
      switch (message.command) {
        case 'cmd':
          this.handleCmd(message)
          break
        case 'answer':
          this.handleAnswer(message)
          break
        case 'candidate':
          this.handleCandidate(message)
          break
        case 'message':
          this.handleMsg(message)
          break
      }
    },
    // cmd 命令
    handleCmd(message) {
      this.cmdUser = message.toId
      if (message.content === 'camera') {
        this.initPeer()
      } else if (message.content === 'screen') {
        this.initScreenPeer()
      }
      this.rtcPeerConnection.createOffer(this.offerOptions).then(this.setLocalAndOffer)
        .catch((e) => {
          console.log(e)
        }
        )
    },
    // answer 命令
    handleAnswer(message) {
      const sdp = JSON.parse(message.content).sdp
      this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(sdp))
    },
    // candidate 命令
    handleCandidate(message) {
      const candidate = JSON.parse(message.content).candidate
      this.rtcPeerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch((e) => {
        console.log(e)
      })
    },
    // message 命令
    handleMsg(message) {
      this.$message({
        message: message.content,
        type: 'warning'
      })
    },
    // 初始化默认 RTCPeerConnection
    initPeer() {
      this.rtcPeerConnection = new RTCPeerConnection(this.configuration)
      this.rtcPeerConnection.onicecandidate = this.handleIceCandidate
      for (const track of this.localMediaStream.getTracks()) {
        this.rtcPeerConnection.addTrack(track, this.localMediaStream)
      }
    },
    // 初始化屏幕共享 RTCPeerConnection
    initScreenPeer() {
      this.rtcPeerConnection = new RTCPeerConnection(this.configuration)
      this.rtcPeerConnection.onicecandidate = this.handleIceCandidate
      for (const track of this.localScreenStream.getTracks()) {
        this.rtcPeerConnection.addTrack(track, this.localScreenStream)
      }
    },
    // 初始化 WebRTC 连接参数
    initWebRTCParam() {
      this.myPeerConnection = null
      this.myPeerConnection = null
      this.RTCPeerConnectionCreated = false
    },
    // 设置 LocalDescription 并发送 offer
    setLocalAndOffer(sessionDescription) {
      this.rtcPeerConnection.setLocalDescription(sessionDescription)
      sendOne(JSON.stringify({
        command: 'offer',
        fromId: this.queryInfo.username,
        toId: this.cmdUser,
        content: { sdp: sessionDescription }
      }))
    },
    // 处理 candidate
    handleIceCandidate(event) {
      if (event.candidate) {
        sendOne(JSON.stringify({
          command: 'candidate',
          fromId: this.queryInfo.username,
          toId: this.monitorUsername,
          content: { candidate: event.candidate }
        }))
      }
    }
  }
}
</script>

<style scoped>

</style>
