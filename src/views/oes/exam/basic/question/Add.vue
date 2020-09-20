<template>
  <div>
    <div
      class="tip custom-block"
      style="margin: 0 0 1.2rem 0"
    >
      <p>
        <strong>提示：</strong>选择相应题型后进行对应题型的题目新增操作，部分题型支持模板 Excel 批量导入。
      </p>
    </div>
    <div class="filter-container">
      <el-select
        v-model="question.typeId"
        class="filter-item"
        placeholder="请选择要新增的题型"
        :disabled="isEdit"
        @change="selectType"
      >
        <el-option
          v-for="item in types"
          :key="item.typeId"
          :label="item.typeName"
          :value="item.typeId"
        />
      </el-select>
      <el-select
        v-model="question.courseId"
        class="filter-item"
        placeholder="请选择试题的对应科目"
        :disabled="isEdit"
        @change="selectType"
      >
        <el-option
          v-for="item in courses"
          :key="item.courseId"
          :label="item.courseName"
          :value="item.courseId"
        />
      </el-select>
    </div>
    <el-divider v-if="currentSelect != null">题目信息录入</el-divider>
    <choice v-if="currentSelect === 'choice'" ref="choice" :course-id="question.courseId" />
    <mul-choice v-if="currentSelect === 'mulChoice'" ref="mulChoice" :course-id="question.courseId" />
    <judge v-if="currentSelect === 'judge'" ref="judge" :course-id="question.courseId" />
    <fill v-if="currentSelect === 'fill'" ref="fill" :course-id="question.courseId" />
    <subjective v-if="currentSelect === 'subjective'" ref="subjective" :course-id="question.courseId" />
  </div>
</template>

<script>
import Choice from './components/Choice'
import MulChoice from './components/MulChoice'
import Judge from './components/Judge'
import Fill from './components/Fill'
import Subjective from './components/Subjective'

export default {
  name: 'Add',
  components: { Choice, MulChoice, Judge, Subjective, Fill },
  props: {
    types: {
      type: Array,
      default: null
    },
    courses: {
      type: Array,
      default: null
    }
  },

  data() {
    return {
      question: this.initQuestion(),
      currentSelect: null,
      isEdit: false,
      rules: {
        typeId: { required: true, message: this.$t('rules.require'), trigger: 'blur' }
      }
    }
  },

  computed: {
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

  methods: {

    reset() {
      this.types = null
    },

    initQuestion() {
      return {
        typeId: null,
        courseId: null
      }
    },

    setTypes(types) {
      this.types = types
    },

    setQuestion(question) {
      this.question = question
      this.isEdit = true
      this.selectType()
      setTimeout(() => {
        this.setEdit(question)
      }, 200)
    },

    setEditStatus(edit) {
      this.isEdit = edit
      this.currentSelect = null
      this.question = this.initQuestion()
    },

    setEdit(question) {
      switch (this.question.typeId) {
        case 1:
          this.$refs.choice.setQuestion(question)
          break
        case 2:
          this.$refs.mulChoice.setQuestion(question)
          break
        case 3:
          this.$refs.judge.setQuestion(question)
          break
        case 4:
          this.$refs.fill.setQuestion(question)
          break
        case 5:
          this.$refs.subjective.setQuestion(question)
          break
        default: break
      }
    },

    selectType() {
      const typeId = this.question.typeId
      if (typeId !== null && this.question.courseId !== null) {
        switch (typeId) {
          case 1: this.currentSelect = 'choice'; break
          case 2: this.currentSelect = 'mulChoice'; break
          case 3: this.currentSelect = 'judge'; break
          case 4: this.currentSelect = 'fill'; break
          case 5: this.currentSelect = 'subjective'; break
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
