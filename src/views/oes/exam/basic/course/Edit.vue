<template>
  <el-dialog
    :title="title"
    :width="width"
    top="50px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-form ref="form" :model="course" :rules="rules" label-position="right" label-width="100px">
      <el-form-item v-show="course.courseId !== ''" :label="$t('table.course.courseId')" prop="courseId">
        <el-input v-model="course.courseId" :readonly="true" />
      </el-form-item>
      <el-form-item
        :label="$t('table.course.courseName')"
        prop="courseName"
      >
        <el-input v-model="course.courseName" :readonly="course.courseId === '' ? false : 'readonly'" />
      </el-form-item>
      <el-form-item :label="$t('table.course.deptName')" prop="deptId">
        <el-select v-model="course.deptId" value="" placeholder="" style="width:100%">
          <el-option
            v-for="item in depts"
            :key="item.deptId"
            :label="item.deptName"
            :value="item.deptId"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('table.course.teacherIds')" prop="teacherIds">
        <el-cascader
          v-model="course.teacherIds"
          value=""
          :options="teachers"
          :props="{ multiple: true,emitPath: false }"
          :show-all-levels="false"
          style="width:100%"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="warning" plain :loading="buttonLoading" @click="isVisible = false">
        {{ $t('common.cancel') }}
      </el-button>
      <el-button type="primary" plain :loading="buttonLoading" @click="submitForm">
        {{ $t('common.confirm') }}
      </el-button>
    </div>
  </el-dialog>
</template>
<script>

import { isIntegerGreaterThanZero } from '@/utils/my-validate'

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
      initFlag: false,
      course: this.initCourse(),
      depts: [],
      teachers: [],
      queryParams: {
        parentId: 0,
        roleId: 6
      },
      buttonLoading: false,
      screenWidth: 0,
      width: this.initWidth(),
      rules: {
        courseName: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { min: 2, max: 20, message: this.$t('rules.range2to20'), trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (!this.course.courseId) {
              this.$get(`exam-basic/course/check/${value}`).then((r) => {
                if (!r.data) {
                  callback(this.$t('rules.courseNameExist'))
                } else {
                  callback()
                }
              })
            } else {
              callback()
            }
          }, trigger: 'blur' }
        ],
        teacherIds: { required: true, message: this.$t('rules.require'), trigger: 'change' },
        deptId: { required: true, message: this.$t('rules.require'), trigger: 'change' },
        score: [
          { validator: (rule, value, callback) => {
            if (value === null || value === '') {
              callback()
            } else if (!isIntegerGreaterThanZero(value)) {
              callback(new Error(this.$t('rules.invalidInteger')))
            } else if (value.toString().length > 3) {
              callback(new Error(this.$t('rules.noMoreThan3')))
            } else {
              callback()
            }
          }, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    },
    isVisible: {
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
    this.initTeacher()
    window.onresize = () => {
      return (() => {
        this.width = this.initWidth()
      })()
    }
  },
  methods: {
    initCourse() {
      return {
        courseId: '',
        courseName: '',
        deptId: '',
        teacherIds: [],
        creatorId: ''
      }
    },
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
    close() {
      this.$emit('close')
    },
    setCourse(val) {
      this.course = { ...val }
    },
    setDepts(val) {
      this.depts = { ...val }
    },
    initTeacher() {
      this.$get('system/user/options', { ...this.queryParams }).then((r) => {
        this.teachers = r.data.data
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = false
          if (!this.course.courseId) {
            // create
            this.course.courseId = null
            this.course.creatorId = this.currentUser.userId
            this.$post('exam-basic/course', { ...this.course }).then(() => {
              this.buttonLoading = false
              this.isVisible = false
              this.$message({
                message: this.$t('tips.createSuccess'),
                type: 'success'
              })
              this.$emit('success')
            })
          } else {
            // update
            this.course.createTime = this.course.updateTime = null
            this.$put('exam-basic/course', { ...this.course }).then(() => {
              this.buttonLoading = false
              this.isVisible = false
              this.$message({
                message: this.$t('tips.updateSuccess'),
                type: 'success'
              })
              this.$emit('success')
            })
          }
        } else {
          return false
        }
      })
    },
    reset() {
      // 先清除校验，再清除表单，不然有奇怪的bug
      this.$refs.form.clearValidate()
      this.$refs.form.resetFields()
      this.course = this.initCourse()
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
