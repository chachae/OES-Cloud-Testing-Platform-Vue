<template>
  <el-dialog
    :title="$t('common.view')"
    :width="width"
    :visible.sync="isVisible"
    class="question-view"
  >
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <h3>{{ $t('common.baseData') }}</h3>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-user" /> <span>{{ $t('table.question.questionId') +'：' }}</span> {{ question.questionId }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-suitcase" /> <span>{{ $t('table.question.typeName') +'：' }}</span> {{ question.typeName }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-trophy" /> <span>{{ $t('table.question.courseName') +'：' }}</span> {{ question.courseName }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-phone-outline" />
          <span>{{ $t('table.question.difficult') +'：' }}</span> {{ transDifficult( question.difficult ) }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-time" /> <span>{{ $t('table.question.createTime') +'：' }}</span>
          {{ question.createTime | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
        </div>
      </el-col>
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-brush" /> <span>{{ $t('table.question.fullName') +'：' }}</span> {{ question.creatorName }}
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <i class="el-icon-burger" /> <span>{{ $t('table.question.consumption') +'：' }}</span> {{ question.consumption }} 次
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="12">
        <div class="view-item">
          <h3>{{ $t('common.questionData') }}</h3>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24">
        <div class="view-item">
          <i class="el-icon-collection-tag" /> <span>{{ $t('table.question.questionName') +'：' }}</span>
          <el-tooltip placement="top" :content="question.questionName" :enterable="false">
            <span>{{ parseQuestionName(question) | ellipsis }}</span>
          </el-tooltip>
        </div>
      </el-col>
    </el-row>
    <template v-if="question.typeId <= 2">
      <div v-for="(item,index) in JSON.parse(question.options)" :key="index">
        <el-row :gutter="10">
          <el-col :xs="24" :sm="24">
            <div class="view-item">
              <i class="el-icon-collection-tag" /> <span>{{ `选项 `+choices[index] +'：' }}</span>
              <el-tooltip placement="top" :content="item" :enterable="false">
                <span>{{ item | ellipsis }}</span>
              </el-tooltip>
            </div>
          </el-col>
        </el-row>
      </div>
    </template>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24">
        <div class="view-item">
          <i class="el-icon-collection-tag" /> <span>{{ $t('table.question.rightKey') +'：' }}</span>
          <el-tooltip placement="top" :content="question.rightKey" :enterable="false">
            <span>{{ transJudge(question.rightKey) | ellipsis }}</span>
          </el-tooltip>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24">
        <div class="view-item">
          <i class="el-icon-collection-tag" /> <span>{{ $t('table.question.analysis') +'：' }}</span>
          <el-tooltip placement="top" :content="question.analysis" :enterable="false">
            <span>{{ !question.analysis ? '暂无':question.analysis | ellipsis }}</span>
          </el-tooltip>
        </div>
      </el-col>
    </el-row>
  </el-dialog>
</template>
<script>
export default {
  name: 'QuestionView',
  filters: {
    ellipsis(value) {
      if (!value) return ''
      if (value.length > 33) {
        return value.slice(0, 33) + '......'
      }
      return value
    }
  },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      choices: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],
      screenWidth: 0,
      width: this.initWidth(),
      question: {},
      replaceSpaces: '{{#@#}}'
    }
  },
  computed: {
    isVisible: {
      get() {
        return this.dialogVisible
      },
      set() {
        this.close()
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
      if (this.screenWidth < 550) {
        return '95%'
      } else if (this.screenWidth < 990) {
        return '580px'
      } else if (this.screenWidth < 1400) {
        return '600px'
      } else {
        return '650px'
      }
    },
    parseQuestionName(question) {
      if (question.typeId === 4) {
        return question.questionName.replaceAll(this.replaceSpaces, '____')
      } else {
        return question.questionName
      }
    },
    setQuestion(val) {
      this.question = { ...val }
    },
    close() {
      this.$emit('close')
    },
    transDifficult(diff) {
      switch (diff) {
        case 1:
          return this.$t('common.question.easy')
        case 2:
          return this.$t('common.question.medium')
        default:
          return this.$t('common.question.hard')
      }
    },
    transJudge(value) {
      if (this.question.typeId !== 3) return value
      switch (value) {
        case 1: return this.$t('common.question.right')
        default: return this.$t('common.question.wrong')
      }
    }
  }
}
</script>
<style lang="scss" scoped>
  .question-view {
    .img-wrapper {
      text-align: center;
      margin-top: -1.5rem;
      margin-bottom: 10px;
      img {
        width: 4rem;
        border-radius: 50%;
      }
    }
    .view-item {
      margin: 7px;
      i {
        font-size: .97rem;
      }
      span {
        margin-left: 5px;
      }
    }
  }
</style>
