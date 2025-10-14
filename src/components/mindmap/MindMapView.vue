<template>
  <div class="h-full p-4">
    <!-- Mindmap Header -->
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-800 mb-2">AI Response Mindmap</h3>
      <p class="text-sm text-gray-600">Visual representation of AI analysis</p>
    </div>

    <!-- Mindmap Canvas -->
    <div class="bg-gray-50 rounded-lg p-4 h-full overflow-auto">
      <!-- Sample Mindmap Structure -->
      <div class="mindmap-container">
        <!-- Central Node -->
        <div class="mindmap-node central-node">
          <div class="node-content">
            <h4 class="font-semibold text-blue-900">Document Analysis</h4>
            <p class="text-xs text-blue-700">Main Topic</p>
          </div>
        </div>

        <!-- Branch Nodes -->
        <div class="mindmap-branch branch-1">
          <div class="mindmap-node branch-node">
            <div class="node-content">
              <h5 class="font-medium text-green-800">Key Points</h5>
              <ul class="text-xs text-green-700 mt-1">
                <li>• Financial Overview</li>
                <li>• Risk Assessment</li>
                <li>• Recommendations</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="mindmap-branch branch-2">
          <div class="mindmap-node branch-node">
            <div class="node-content">
              <h5 class="font-medium text-purple-800">Insights</h5>
              <ul class="text-xs text-purple-700 mt-1">
                <li>• Revenue Growth</li>
                <li>• Market Trends</li>
                <li>• Strategic Focus</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="mindmap-branch branch-3">
          <div class="mindmap-node branch-node">
            <div class="node-content">
              <h5 class="font-medium text-orange-800">Action Items</h5>
              <ul class="text-xs text-orange-700 mt-1">
                <li>• Review Contracts</li>
                <li>• Update Policies</li>
                <li>• Schedule Meeting</li>
              </ul>
            </div>
          </div>
        </div>

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

        <!-- Connecting Lines -->
        <svg class="mindmap-connections" viewBox="0 0 400 300">
          <line x1="200" y1="150" x2="100" y2="80" stroke="#cbd5e1" stroke-width="2"/>
          <line x1="200" y1="150" x2="300" y2="80" stroke="#cbd5e1" stroke-width="2"/>
          <line x1="200" y1="150" x2="100" y2="220" stroke="#cbd5e1" stroke-width="2"/>
          <line x1="200" y1="150" x2="300" y2="220" stroke="#cbd5e1" stroke-width="2"/>
        </svg>
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

.mindmap-connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.mindmap-node {
  position: absolute;
  z-index: 2;
  transition: all 0.3s ease;
}

.central-node {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.central-node .node-content {
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  color: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  text-align: center;
  min-width: 120px;
}

.branch-node .node-content {
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 2px solid #e2e8f0;
  min-width: 140px;
  max-width: 180px;
}

.branch-1 {
  top: 15%;
  left: 15%;
}

.branch-2 {
  top: 15%;
  right: 15%;
}

.branch-3 {
  bottom: 25%;
  left: 15%;
}

.branch-4 {
  bottom: 25%;
  right: 15%;
}

.mindmap-node:hover {
  transform: scale(1.05);
}

.central-node:hover {
  transform: translate(-50%, -50%) scale(1.05);
}

.branch-node:hover .node-content {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
</style>