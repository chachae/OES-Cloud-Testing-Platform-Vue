<template>
  <el-dialog
    :title="title"
    :width="width"
    top="50px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-form ref="form" :model="question" :rules="rules" label-position="right" label-width="100px">
      <el-form-item v-show="question.questionId !== ''" :label="$t('table.question.questionId')" prop="questionId">
        <el-input v-model="question.questionId" :readonly="true" />
      </el-form-item>
      <el-form-item :label="$t('table.question.courseName')" prop="courseId">
        <el-select
          v-model="question.courseId"
          value=""
          placeholder=""
          style="width:100%"
          :disabled="question.questionId!==''"
        >
          <el-option
            v-for="item in courses"
            :key="item.courseId"
            :label="item.courseName"
            :value="item.courseId"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('table.question.typeName')" prop="typeId">
        <el-select
          v-model="question.typeId"
          value=""
          placeholder=""
          style="width:100%"
          :disabled="question.questionId!==''"
        >
          <el-option
            v-for="item in types"
            :key="item.typeId"
            :label="item.typeName"
            :value="item.typeId"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('table.question.questionName')" prop="questionName">
        <el-input
          v-model=" question.questionName "
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6}"
          placeholder=""
          :readonly="question.questionId!==''"
          maxlength="100"
        />
      </el-form-item>
      <!-- 选项开始 -->
      <template v-if="isChoice()">
        <el-form-item :label="$t('table.question.optionA')" prop="optionA">
          <el-input
            v-model=" question.optionA "
            placeholder=""
            :readonly="question.consumption !== 0"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item
          v-show="question.optionA !== ''"
          :label="$t('table.question.optionB')"
          prop="optionB"
          show-word-limit
        >
          <el-input
            v-model=" question.optionB "
            placeholder=""
            :readonly="question.consumption !== 0"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item
          v-show="question.optionB !== ''"
          :label="$t('table.question.optionC')"
          prop="optionC"
          maxlength="20"
          show-word-limit
        >
          <el-input
            v-model=" question.optionC "
            placeholder=""
            :readonly="question.consumption !== 0"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item
          v-show="question.optionC !== ''"
          :label="$t('table.question.optionD')"
          prop="optionD"
          maxlength="20"
          show-word-limit
        >
          <el-input
            v-model=" question.optionD "
            placeholder=""
            :readonly="question.consumption !== 0"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item
          v-show="isMultiChoice() && question.optionD !== ''"
          :label="$t('table.question.optionE')"
          prop="optionE"
          maxlength="20"
          show-word-limit
        >
          <el-input
            v-model=" question.optionE "
            placeholder=""
            :readonly="question.consumption !== 0"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item
          v-show="isMultiChoice() && question.optionE !== ''"
          :label="$t('table.question.optionF')"
          prop="optionF"
          maxlength="20"
          show-word-limit
        >
          <el-input
            v-model=" question.optionF "
            placeholder=""
            :readonly="question.consumption !== 0"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <!-- 选项结束 -->
      </template>

      <el-form-item :label="$t('table.question.rightKey')" prop="rightKey">
        <!-- 答案框（分为选择题、判断题、其他） -->
        <!-- 选择 -->
        <template v-if="isChoice()">
          <el-input
            v-model="question.rightKey"
            placeholder="多选题使用英文逗号隔开，如：A,B,C"
            :readonly="question.consumption !== 0"
            :maxlength="isMultiChoice() ? 10 : 1"
            show-word-limit
          />
        </template>
        <!-- 判断 -->
        <template v-else-if="isJudge()">
          <el-select
            v-model="question.rightKey"
            placeholder=""
            style="width: 100%"
            :disabled="question.consumption !== 0"
          >
            <el-option
              v-for="item in judges"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
        <!-- 其它 -->
        <template v-else>
          <el-input
            v-model="question.rightKey"
            placeholder=""
            type="textarea"
            :autosize="{ minRows: 2 , maxRows: 6 }"
            :readonly="question.consumption !== 0"
            maxlength="250"
            show-word-limit
          />
        </template>
      </el-form-item>
      <el-form-item :label="$t('table.question.analysis')" prop="analysis">
        <el-input
          v-model=" question.analysis "
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 6}"
          placeholder=""
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
      <el-form-item v-show="question.questionId !== ''" :label="$t('table.question.fullName')" prop="fullName">
        <el-input v-model="question.fullName" :readonly="true" />
      </el-form-item>
      <el-form-item :label="$t('table.question.difficult')" prop="difficult">
        <el-rate
          v-model=" question.difficult "
          :max="3"
          :show-text="false"
          :show-score="false"
          style="margin-top: 10px"
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
      courses: [],
      types: [],
      question: this.initQuestion(),
      judges: [{ value: '1', label: this.$t('common.question.right') }, { value: '0', label: this.$t('common.question.wrong') }],
      choices: ['A', 'B', 'C', 'D', 'E', 'F'],
      queryParams: {
        parentId: 0,
        roleId: 6
      },
      buttonLoading: false,
      screenWidth: 0,
      width: this.initWidth(),
      rules: {
        courseId: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        questionName: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { min: 3, max: 100, message: this.$t('rules.range3to100'), trigger: 'blur' }
        ],
        rightKey: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { min: 1, max: 250, message: this.$t('rules.range1to250'), trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (value === null || value === '') {
              callback()
            } else if (this.question.typeId === 1 && this.choices.indexOf(value) === -1) {
              callback(new Error(this.$t('rules.invalidChoice')))
            } else if (this.question.typeId === 2) {
              value.split(',').forEach((r) => {
                if (this.choices.indexOf(r) === -1) callback(new Error(this.$t('rules.invalidChoice')))
              })
            } else {
              callback()
            }
          }, trigger: 'blur'
          }
        ],
        analysis: { min: 3, max: 100, message: this.$t('rules.range3to100'), trigger: 'blur' },
        difficult: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        typeId: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        optionA: { required: true, message: this.$t('rules.require'), trigger: 'blur' }
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
    window.onresize = () => {
      return (() => {
        this.width = this.initWidth()
      })()
    }
  },
  methods: {
    initQuestion() {
      return {
        questionId: '',
        courseId: '',
        typeId: '',
        questionName: '',
        typeName: '',
        courseName: '',
        analysis: '',
        fullName: '',
        difficult: 1,
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        optionE: '',
        optionF: '',
        consumption: 0,
        creatorId: '',
        rightKey: ''
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
    setQuestion(val) {
      this.question = { ...val }
    },
    setCourses(val) {
      this.courses = { ...val }
    },
    setTypes(val) {
      this.types = { ...val }
    },
    isChoice() {
      return (this.question.typeId === 1 || this.question.typeId === 2)
    },
    isJudge() {
      return this.question.typeId === 3
    },
    isMultiChoice() {
      return this.question.typeId === 2
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = false
          if (!this.question.questionId) {
            // create
            if (this.question.typeId === 1) {
              this.question.optionE = this.question.optionF = null
            } else if (this.question.typeId !== 1 && this.question.typeId !== 2) {
              this.question.optionA = this.question.optionB = this.question.optionC =
                this.question.optionD = this.question.optionE = this.question.optionF = null
            }
            this.question.creatorId = this.currentUser.userId
            this.$post('examination/question', { ...this.question }).then(() => {
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
            this.question.createTime = this.question.updateTime = null
            this.$put('examination/question', { ...this.question }).then(() => {
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
      this.question = this.initQuestion()
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
