<template>
  <el-dialog
    title="活体人脸与卡证识别"
    :width="width"
    top="50px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isTrackingVisible"
  >
    <div id="video-background" class="bk-radius">
      <video
        v-show="base64Str === ''"
        id="video-circle"
        class="video-camera"
        preload
        autoplay
        loop
        muted
      />
    </div>
    <canvas v-show="flag === false" id="canvas1" width="600" height="600" />
    <el-button plain type="primary" @click="resetTracking">刷新</el-button>
  </el-dialog>
</template>

<script>
require('tracking/build/tracking-min.js')
require('tracking/build/data/face-min.js')
require('tracking/build/data/mouth-min.js')
export default {
  name: 'Tracking',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      width: this.initWidth(),
      trackerTask: '',
      tracker: {},
      mediaStreamTrack: {},
      video: {},
      count: 0,
      flag: true,
      base64Str: ''
    }
  },
  computed: {
    isTrackingVisible: {
      get() {
        return this.dialogVisible
      },
      set() {
        this.close()
        this.reset()
      }
    }
  },
  mounted() {
    window.onresize = () => {
      return (() => {
        this.width = this.initWidth()
      })()
    }
  },
  methods: {
    initWidth() {
      this.screenWidth = document.body.clientWidth
      if (this.screenWidth < 991) {
        return '90%'
      } else if (this.screenWidth < 1400) {
        return '45%'
      } else {
        return '800px'
      }
    },
    resetTracking() {
      this.flag = true
      this.base64Str = ''
      this.trackerTask = ''
      this.tracker = {}
      this.mediaStreamTrack = {}
      this.video = {}
      this.count = 0
      this.initTracking()
    },
    initTracking() {
      // 使用 nextTick 才能获取 dialog 中的 dom 节点
      this.$nextTick(() => {
        const _this = this
        _this.openCamera()
        const video = _this.video = document.getElementById('video-circle')
        _this.tracker = new window.tracking.ObjectTracker('face')
        _this.tracker.setInitialScale(4)
        _this.tracker.setStepSize(2)
        // 转头角度影响识别率
        _this.tracker.setEdgesDensity(0.1)
        _this.trackerTask = window.tracking.track('#video-circle', _this.tracker)
        _this.tracker.on('track', function(event) {
          if (event.data.length) {
          // 会不停的去检测人脸，所以这里需要做个锁
            if (_this.flag) {
              _this.flag = false
              // 裁剪并绘制
              const canvasUpload = document.getElementById('canvas1')
              const contextUpload = canvasUpload.getContext('2d')
              contextUpload.drawImage(video, 0, 0, 600, 600)
              // 人脸 base64
              _this.base64Str = canvasUpload.toDataURL('image/jpeg')
              // 关闭摄像头
              _this.closeCamera()
              // 直接获取 base64 不显示画布可开启
              _this.flag = true
              contextUpload.clearRect(0, 0, 600, 600)
              // 人脸对比
              _this.faceMatch()
            }
          }
        })
      })
    },
    openCamera() {
      if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {}
      }
      if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
          // 首先，如果有getUserMedia的话，就获得它
          const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
          // 一些浏览器根本没实现它 - 那么就返回一个error到promise的reject来保持一个统一的接口
          if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia 浏览器不支持摄像头'))
          }
          // 否则，为老的navigator.getUserMedia方法包裹一个Promise
          return new Promise(function(resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject)
          })
        }
      }
      const constraints = {
        video: true,
        audio: false
      }
      const promise = navigator.mediaDevices.getUserMedia(constraints)
      promise.then(stream => {
        this.mediaStreamTrack = stream.getTracks()[0]
        window.stream = stream
        const video = document.getElementById('video-circle')
        // 旧的浏览器可能没有srcObject
        if ('srcObject' in video) {
          video.srcObject = stream
        } else {
          video.src = window.URL.createObjectURL(stream)
        }
        video.onloadedmetadata = function(e) {
          video.play()
        }
      }).catch(err => {
        console.error(err.name + ': ' + err.message)
        console.error('获取权限失败')
      })
    },
    closeCamera() {
      if (typeof window.stream === 'object') {
        if ('srcObject' in this.video) {
          this.video.srcObject = null
        }
        window.stream.getTracks().forEach(track => track.stop())
      }
    },
    faceMatch() {
      this.$post('ai/face/match', { image: this.base64Str.slice(23) }).then((r) => {
        const score = r.data.data.score
        this.$message({
          message: '核验成功，匹配率：' + score + '%',
          type: 'success'
        })
        this.$emit('success')
      })
    },
    close() {
      this.flag = false
      const canvas1 = document.getElementById('canvas1')
      canvas1.remove()
      this.$emit('close')
    },
    reset() {
      // this.$refs.form.clearValidate()
      // this.$refs.form.resetFields()
    }
  }
}
</script>

<style scoped>
  .bk-radius {
    width: 200px;
    height: 200px;
    overflow: hidden;
    background-color: #aaaaaa;
    border-radius: 50%;
    margin: auto
  }
  .video-camera {
    width: 300px;
    height: 300px;
    margin-top: -40px;
    margin-left: -40px;
  }

</style>
