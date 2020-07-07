<template>
  <div class="app-container">
    <aside>
      <span>
        <el-link type="primary"><a href="https://github.com/tinymce/tinymce-vue" target="_blank">TinyMCE富文本编辑器官方仓库</a></el-link></span>
    </aside>
    <div>
      <tinymce v-model="content" :height="300" />
    </div>
    <div class="editor-content" v-html="content" />
    <el-button style="margin-top:10px;" type="primary" icon="el-icon-document" @click="getHtml">
      Get HTML
    </el-button>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'

export default {
  name: 'TinymceDemo',
  components: { Tinymce },
  data() {
    return {
      content: ''
    }
  },
  methods: {
    getHtml() {
      console.log(this.content)
    }
  }
}
</script>
<style lang="scss" scoped>
  .editor-content{
    margin-top: 20px;
  }
</style>

