<template>
  <div>
    <p>
      <strong>
        <i class="el-icon-magic-stick" />
        题目解析 :
      </strong>
      {{ analysis }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'Analysis',
  props: {
    analysis: {
      type: String,
      default: '暂无解析'
    }
  }
}
</script>
