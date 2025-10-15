<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="closeViewer"
  >
    <div class="bg-white rounded-lg w-full max-w-4xl h-5/6 flex flex-col">
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-medium">{{ document?.name }}</h3>
        <button
          @click="closeViewer"
          class="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Close (ESC)"
        >
          <XIcon class="w-5 h-5" />
        </button>
      </div>
      <div class="flex-1 p-4">
        <iframe
          v-if="document"
          :src="document.url"
          class="w-full h-full border border-gray-200 rounded"
          type="application/pdf"
        >
          <p>
            Your browser does not support PDFs. 
            <a :href="document.url" target="_blank" class="text-blue-600 underline">
              Download the PDF
            </a>.
          </p>
        </iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XIcon } from 'lucide-vue-next'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  document: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['close'])

// Methods
const closeViewer = () => {
  emit('close')
}
</script>