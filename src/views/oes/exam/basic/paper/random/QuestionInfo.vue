<template>
  <div>
    <el-divider v-if="typeIds.length > 0" content-position="left">题型分布数据明细</el-divider>
    <el-row v-for="typeId in typeIds" :key="typeId" :gutter="10">
      <el-col :xs="24" :sm="8">
        <el-form-item :label="calTypeName(typeId) + ` : 数量`">
          <el-input-number
            v-model="paperTypes[calTypeIdIndex(typeId)].num"
            :min="1"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="6">
        <el-form-item label="每题分值">
          <el-input-number
            v-model="paperTypes[calTypeIdIndex(typeId)].score"
            :min="0"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="6">
        <el-form-item label="模块分值">
          <el-input :value="paperTypes[calTypeIdIndex(typeId)].score * paperTypes[calTypeIdIndex(typeId)].num " :readonly="true">
            <template slot="append">分</template>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'QuestionInfo',
  props: {
    typeIds: {
      type: Array,
      required: true
    },
    types: {
      type: Array,
      required: true
    },
    paperTypes: {
      type: Array,
      required: true
    }
  },

  watch: {
    types(newVal, oldVal) {
      this.initPaperType()
    },
    typeIds(newVal, oldVal) {
      if (newVal.length < oldVal.length) {
        for (let i = 0; i < oldVal.length; i++) {
          if (newVal[i] !== oldVal[i]) {
            this.paperTypes[i].score = 0
            this.paperTypes[i].num = 1
            break
          }
        }
      }
    }
  },

  methods: {
    initPaperType() {
      for (let i = 0; i < this.types.length; i++) {
        const obj = { 'score': 0, 'num': 1 }
        this.$set(this.paperTypes, i, obj)
      }
    },
    calTypeIdIndex(typeId) {
      for (let i = 0; i < this.types.length; i++) {
        if (typeId === this.types[i].typeId) {
          return i
        }
      }
    },
    calTypeName(typeId) {
      for (let i = 0; i < this.types.length; i++) {
        if (typeId === this.types[i].typeId) {
          return this.types[i].typeName
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
