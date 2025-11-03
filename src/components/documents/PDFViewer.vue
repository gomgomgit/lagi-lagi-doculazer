<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="closeViewer"
  >
    <div class="bg-white rounded-lg w-full max-w-4xl h-5/6 flex flex-col">
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-medium">{{ document?.file_name || document?.name || 'PDF Document' }}</h3>
        <button
          @click="closeViewer"
          class="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Close (ESC)"
        >
          <XIcon class="w-5 h-5" />
        </button>
      </div>
      <div class="flex-1 p-4 overflow-hidden">
        <object
          v-if="document && document.url"
          :data="document.url"
          type="application/pdf"
          class="w-full h-full border border-gray-200 rounded"
        >
          <iframe
            :src="document.url"
            class="w-full h-full border border-gray-200 rounded"
          >
            <p class="p-4 text-center">
              Your browser does not support PDFs. 
              <a :href="document.url" download :download="document.file_name" class="text-blue-600 underline hover:text-blue-800">
                Click here to download the PDF
              </a>
            </p>
          </iframe>
        </object>
        <div v-else class="flex items-center justify-center h-full text-gray-500">
          <div class="text-center">
            <p class="text-lg font-medium mb-2">Unable to load PDF document</p>
            <p class="text-sm">Document: {{ document ? 'exists' : 'null' }}</p>
            <p class="text-sm">URL: {{ document?.url ? 'exists' : 'missing' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
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

// Watch for changes to debug
watch(() => props.show, (newVal) => {
  console.log('PDFViewer show changed:', newVal)
})

watch(() => props.document, (newVal) => {
  console.log('PDFViewer document changed:', newVal)
  if (newVal && newVal.url) {
    console.log('PDFViewer document URL:', newVal.url)
  }
}, { deep: true })

// Emits
const emit = defineEmits(['close'])

// Methods
const closeViewer = () => {
  emit('close')
}
</script>