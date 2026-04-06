<template>
  <div class="card stat-card">
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value">{{ value }}</div>
    <div class="stat-hint">{{ hint }}</div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number],
  hint: String
})
</script>
