<template>
  <div class="text-2xl font-medium mb-4 border-b border-gray-400 pb-2">
    {{ title }}
    <div v-if="subtitle" class="text-sm text-secondary">{{ subtitle }}</div>
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