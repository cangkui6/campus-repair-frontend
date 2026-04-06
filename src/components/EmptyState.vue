<template>
  <div class="empty-state">
    <div class="empty-state__icon">{{ icon }}</div>
    <div>
      <div class="empty-state__title">{{ title }}</div>
      <div class="empty-state__text">{{ text }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '◎' },
  title: { type: String, default: '暂无数据' },
  text: { type: String, default: '当前没有可展示的内容。' }
})
</script>
