<template>
  <div class="h-full py-4 px-4">
    <!-- Empty State -->
    <div v-if="!chunkData" class="flex flex-col items-center justify-center h-full text-center">
      <BrainIcon class="w-16 h-16 text-gray-300 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No Context Selected</h3>
      <p class="text-sm text-gray-600">Click on a chunk reference in the chat to view its context here</p>
    </div>

    <!-- Chunk Data Display -->
    <div v-else class="space-y-4">

      <!-- Chunk Content -->
      <div class="">
        <div class="flex justify-between">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Content:</h4>
          <p class="text-sm text-gray-600">Page : {{ chunkData.page_number_start == chunkData.page_number_end ? chunkData.page_number_start : chunkData.page_number_start + ' - ' + chunkData.page_number_end }}</p>
        </div>
        <div 
          class="text-sm text-gray-900 leading-relaxed markdown-content"
          v-html="chunkData.content ? '...' + parseMarkdownBasic(chunkData.content) + '...' : 'No content available'"
        ></div>
      </div>

      <!-- Chunk Metadata -->
      <!-- <div v-if="chunkData.metadata" class="space-y-2">
        <h4 class="text-sm font-semibold text-gray-700">Metadata:</h4>
        <div class="bg-white rounded-lg border border-gray-200 divide-y">
          <div 
            v-for="(value, key) in chunkData.metadata" 
            :key="key"
            class="px-4 py-2 flex items-start gap-3"
          >
            <span class="text-xs font-medium text-gray-500 min-w-[100px]">{{ formatKey(key) }}:</span>
            <span class="text-sm text-gray-900 flex-1">{{ formatValue(value) }}</span>
          </div>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { BrainIcon } from 'lucide-vue-next'
import { useMarkdown } from '@/composables/useMarkdown'

// Use markdown composable
const { parseMarkdownBasic } = useMarkdown()

// Props
const props = defineProps({
  chunkData: {
    type: Object,
    default: null
  }
})

// Format metadata key for display
const formatKey = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

// Format metadata value for display
const formatValue = (value) => {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
</script>

<style scoped>
.mindmap-container {
  position: relative;
  width: 100%;
  height: 400px;
  min-height: 400px;
}

.branch-node .node-content {
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  min-width: 140px;
  max-width: 180px;
}
</style>