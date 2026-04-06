<template>
  <span class="status-pill" :data-tone="tone">{{ label }}</span>
</template>

<script setup>
import { computed } from 'vue'
import { statusToneMap } from '../utils'

const props = defineProps({
  label: { type: String, default: '-' }
})

const tone = computed(() => statusToneMap[props.label] || 'default')
</script>
