<template>
  <div class="flex justify-between items-center border-b border-gray-400 pb-2">
    <div class="text-2xl font-medium">
      {{ title }}
      <div v-if="subtitle" class="text-sm text-secondary">{{ subtitle }}</div>
    </div>
    <slot name="action"></slot>
  </div>
</template>

<script setup>
// Props untuk komponen
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  }
})
</script>