<template>
  <div>
    <key-parse
      :right-key="warnAnswer"
      :type-id="typeId"
      :component-type="0"
    />
  </div>
</template>

<script>
import KeyParse from './KeyParse'
export default {
  name: 'WarnAnswer',
  components: { KeyParse },
  props: {
    warnAnswer: {
      type: String,
      default: ''
    },
    typeId: {
      type: Number,
      required: true
    },
    rightKey: {
      type: String,
      default: ''
    }
  }
}
</script>
