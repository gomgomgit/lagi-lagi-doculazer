<template>
  <div class="h-full py-4">
    <!-- Mindmap Header -->
    <div class="mb-4">
      <h3 class="text-lg font-medium text-gray-800">AI Response Mindmap</h3>
      <p class="text-sm text-gray-600">Visual representation of AI analysis</p>
    </div>

    <!-- Mindmap Canvas -->
    <div class="bg-gray-50 rounded-lg p-4 h-full overflow-auto">
      <!-- Sample Mindmap Structure -->
      <div class="mindmap-container">

        <div class="mindmap-branch branch-4">
          <div class="mindmap-node branch-node">
            <div class="node-content">
              <h5 class="font-medium text-red-800">Concerns</h5>
              <ul class="text-xs text-red-700 mt-1">
                <li>• Compliance Issues</li>
                <li>• Budget Constraints</li>
                <li>• Timeline Pressure</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <!-- Empty State -->
      <div v-if="!hasAIResponse" class="text-center py-12 text-gray-500">
        <BrainIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No AI Analysis Yet</h3>
        <p class="text-gray-600">Send a message to generate mindmap visualization</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { BrainIcon } from 'lucide-vue-next'

// Props
defineProps({
  aiResponse: {
    type: Object,
    default: null
  }
})

// State
const hasAIResponse = ref(true) // Set to false for empty state
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