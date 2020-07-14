<template>
  <div class="filter-container" style="display: block">
    <div
      v-if="showVerifyTip"
      class="tip custom-block"
    >
      <p class="custom-block-title"><strong>提示</strong></p>
      <p>身份信息核验中，稍等片刻后刷新本页面以查看审核结果</p>
    </div>
    <div
      v-if="!showVerifyTip && hasIdentify"
      class="tip custom-block"
    >
      <p class="custom-block-title"><strong>身份信息核验已通过，核验结果如下：</strong></p>
      <p>真实姓名：{{ identify.name }}</p>
      <p>身份证号：{{ identify.num }}</p>
    </div>
    <div v-if="!showVerifyTip && hasIdentify" style="display: block">
      <el-form ref="form" :model="checkInfo" :rules="rules" label-position="right" label-width="80px" class="form">
        <el-form-item label="真实姓名" maxlength="20" prop="name">
          <el-input v-model="checkInfo.name" clearable />
        </el-form-item>
        <el-form-item label="身份证号" prop="num">
          <el-input v-model="checkInfo.num" maxlength="18" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="buttonLoading" plain @click="check">校验</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div
      v-if="!hasIdentify"
      class="warning custom-block"
    >
      <p class="custom-block-title"><strong>警告</strong></p>
      <p>个人身份信息暂未核验，请根据如下操作提示完成相关的身份核验工作以确保后续能正常访问系统和进行在线考试</p>
    </div>
    <div v-if="!hasIdentify" style="display: block">
      <el-row :gutter="10">
        <el-col :xs="24" :sm="12">
          <div class="filter-container">
            <el-upload
              :before-upload="handleBeforeUpload"
              :on-success="handleBackSuccess"
              :on-remove="handleRemove"
              :on-error="handleError"
              list-type="picture"
              :action="uploadBackUrl"
              :headers="headers"
              :limit="1"
            >
              <el-button plain type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">上传身份证正面（国徽面），图片不能超过1MB</div>
            </el-upload>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12">
          <div class="filter-container">
            <el-upload
              :before-upload="handleBeforeUpload"
              :on-success="handleFaceSuccess"
              :on-remove="handleRemove"
              :on-error="handleError"
              list-type="picture"
              :action="uploadFaceUrl"
              :headers="headers"
              :limit="1"
            >
              <el-button plain type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">上传身份证背面（人像面），图片不能超过1MB</div>
            </el-upload>
          </div>
        </el-col>
      </el-row>
    </div>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div>
          <el-button v-if="!hasIdentify" plain type="primary" :loading="buttonLoading" @click="submit">提交</el-button>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { validateImageExt, is2thIdCard } from '@/utils/my-validate'
import { idCardBackUrl, idCardFaceUrl } from '@/settings'
import { getToken } from '@/utils/auth'

export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          email: ''
        }
      }
    }
  },
  data() {
    return {
      headers: {
        Authorization: `bearer ${getToken()}`
      },
      uploadBackUrl: idCardBackUrl,
      uploadFaceUrl: idCardFaceUrl,
      identify: '',
      backInfo: null,
      faceInfo: null,
      showVerifyTip: false,
      hasIdentify: false,
      buttonLoading: false,
      hasUploadFace: false,
      hasUploadBack: false,
      checkInfo: {
        num: '',
        name: ''
      },
      rules: {
        name: [{ required: true, message: this.$t('rules.require'), trigger: 'blur' }],
        num: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (!is2thIdCard(value)) {
              callback(this.$t('rules.invalid2thIdCard'))
            } else {
              callback()
            }
          }, trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.getUserIdentify()
  },
  methods: {
    getUserIdentify() {
      this.$get(`system/id-card/verify/me`).then((r) => {
        if (r.data.data) {
          const info = r.data.data
          this.identify = info
          if (info !== null) {
            this.hasIdentify = true
          }
        }
      })
    },
    handleBeforeUpload(file) {
      const ext = file.name.replace(/.+\./, '')
      if (!validateImageExt(ext)) {
        this.$message({
          type: 'error',
          message: '禁止上传' + ext + '类型的附件'
        })
        return false
      }
      if (file.size / 1024 > 1000) {
        this.$message({
          message: '上传图片大小不能超过1MB!',
          type: 'error'
        })
        return false
      }
    },
    handleBackSuccess(response, file, fileList) {
      this.backInfo = response.data
      this.hasUploadBack = true
    },
    handleFaceSuccess(response, file, fileList) {
      this.faceInfo = response.data
      this.hasUploadFace = true
    },
    handleError(response, file, fileList) {
      this.$message({
        type: 'error',
        message: JSON.parse(response.message).message
      })
    },
    handleRemove() {
      this.hasUploadFace = this.hasUploadBack = false
    },
    check() {
      this.buttonLoading = true
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$post('system/id-card/verify/auth', { ...this.checkInfo }).then((r) => {
            if (r.data) {
              this.$message({
                message: '身份信息一致，校验通过',
                type: 'success'
              })
              this.$refs.form.resetFields()
            } else {
              this.$message({
                message: '身份信息不一致，校验失败',
                type: 'error'
              })
            }
          })
        }
        this.buttonLoading = false
      })
    },
    submit() {
      if (this.hasUploadBack && this.hasUploadFace) {
        this.buttonLoading = true
        this.$post('system/id-card/verify', { ...this.backInfo, ...this.faceInfo }).then(() => {
          this.showVerifyTip = true
          this.hasIdentify = true
          this.$message({
            message: this.$t('tips.createSuccess'),
            type: 'success'
          })
          this.buttonLoading = false
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .el-card.is-always-shadow {
    box-shadow: none;
  }
  .el-card {
    border: 1px solid #f1f1f1;
    border-radius: 2px;
  }
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
</style>
