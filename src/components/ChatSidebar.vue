<script setup>

import MarkdownIt from "markdown-it";
const markdown = new MarkdownIt();
</script>
<template>
  <div
    v-html="
      markdown.render(
        '### 您有一个办件需要处理\n - 发送时间：2020-02-21\n - 发送人：张三'
      )
    "
  ></div>
</template>

