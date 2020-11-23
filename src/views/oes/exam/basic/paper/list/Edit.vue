<template>
  <el-dialog
    :title="title"
    :width="width"
    top="50px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isEditVisible"
  >
    <div class="el-dialog-div">
      <el-form ref="form" :model="paper" :rules="rules" label-position="right" label-width="100px">
        <el-form-item :label="$t('table.paper.paperId')" prop="paperId">
          <el-input v-model="paper.paperId" :readonly="true" />
        </el-form-item>
        <el-form-item :label="$t('table.paper.paperName')" prop="paperName">
          <el-input v-model="paper.paperName" :readonly="true" />
        </el-form-item>
        <el-form-item :label="$t('table.paper.courseName')" prop="courseName">
          <el-input v-model="paper.courseName" :readonly="true" />
        </el-form-item>
        <el-form-item :label="$t('table.paper.status')" prop="status">
          <el-switch
            v-model="paper.status"
            :active-text="$t('common.active')"
            :inactive-text="$t('common.inactive')"
            :active-value="1"
            :inactive-value="0"
            :disabled="paper.isEnd"
          />
        </el-form-item>
        <el-form-item label="试题乱序">
          <el-switch
            v-model="paper.configRandomQuestionOrder"
            :active-value="true"
            :inactive-value="false"
            active-text="开启"
            inactive-text="关闭"
            :disabled="paper.isEnd"
          />
        </el-form-item>
        <el-form-item label="标签切换检测">
          <el-switch
            v-model="paper.configLabelSwitch"
            :active-value="true"
            :inactive-value="false"
            active-text="开启"
            inactive-text="关闭"
            :disabled="paper.isEnd"
          />
        </el-form-item>
        <el-form-item label="远程监控">
          <el-switch
            v-model="paper.configRemote"
            :active-value="true"
            :inactive-value="false"
            active-text="开启"
            inactive-text="关闭"
            :disabled="paper.isEnd"
          />
        </el-form-item>
        <el-form-item :label="$t('table.paper.deptNames')" prop="deptIds">
          <el-tree
            ref="deptTree"
            :data="deptTree"
            :check-strictly="true"
            :default-checked-keys="paper.deptIds"
            show-checkbox
            accordion
            node-key="id"
            highlight-current
            style="border: 1px solid #DCDFE6;border-radius: 3px;padding: 6px;"
          />
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="warning" plain :loading="buttonLoading" @click="isEditVisible = false">
        {{ $t('common.cancel') }}
      </el-button>
      <el-button type="primary" plain :loading="buttonLoading" @click="submitForm">
        {{ $t('common.confirm') }}
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { depts } from '@/api/system/dept'
import { updatePaper } from '@/api/exam/basic/paper'
export default {
  name: 'CourseEdit',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      deptTree: [],
      paper: this.initPaper(),
      initFlag: false,
      buttonLoading: false,
      screenWidth: 0,
      screenHeight: 0,
      width: this.initWidth(),
      rules: {
        paperId: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        paperName: { required: true, message: this.$t('rules.require'), trigger: 'blur' }
      }
    }
  },
  resetDeptTree() {
    this.$refs.deptTree.setCheckedKeys([])
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    },
    isEditVisible: {
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
    this.initDept()
    window.onresize = () => {
      return (() => {
        this.width = this.initWidth()
        this.hight = this.initHeight()
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
    initPaper() {
      return {
        paperId: '',
        paperName: '',
        courseName: '',
        deptIds: [],
        status: '',
        isEnd: '',
        configRandomQuestionOrder: '',
        configLabelSwitch: '',
        configRemote: ''
      }
    },
    resetDeptTree() {
      this.$refs.deptTree.setCheckedKeys([])
    },
    initDept() {
      depts().then((r) => {
        this.depts = r.data.data.rows
        this.deptTree = this.depts
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    close() {
      this.$emit('close')
    },
    setPaper(val) {
      this.paper = { ...val }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = false
          this.paper.deptIds = this.$refs.deptTree.getCheckedKeys()
          this.paper.startTime = this.paper.endTime = this.paper.createTime = this.paper.updateTime = this.paper.paperQuestions = null
          updatePaper(this.paper).then(() => {
            this.buttonLoading = false
            this.isEditVisible = false
            this.$message({
              message: this.$t('tips.updateSuccess'),
              type: 'success'
            })
            this.$emit('success')
          })
        } else {
          return false
        }
      })
    },
    reset() {
      // 先清除校验，再清除表单，不然有奇怪的bug
      this.$refs.form.clearValidate()
      this.$refs.form.resetFields()
      this.paper = this.initPaper()
      this.resetDeptTree()
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
