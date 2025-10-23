<template>
  <div 
    v-if="show && filteredDocuments.length > 0"
    class="absolute bottom-full right-0 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
  >
    <div class="p-2">
      <div class="text-xs text-gray-500 mb-2 px-2">Select document to mention</div>
      <div 
        v-for="(document, index) in filteredDocuments" 
        :key="document.id"
        :class="[
          'flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors',
          index === selectedIndex 
            ? 'bg-blue-50 border-blue-200' 
            : 'hover:bg-gray-50'
        ]"
        @click="$emit('select', document)"
        @mouseenter="selectedIndex = index"
      >
        <!-- Document Icon -->
        <div class="flex-shrink-0">
          <component 
            :is="getDocumentIcon(document.type || 'unknown')" 
            class="w-4 h-4 text-gray-500" 
          />
        </div>
        
        <!-- Document Info -->
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-gray-900 truncate">
            {{ document.file_name }}
          </div>
          <div class="text-xs text-gray-500 truncate">
            {{ document.company || 'No Company' }} • {{ formatFileSize(document.file_size || 0) }}
          </div>
        </div>
        
        <!-- Document Type Badge -->
        <!-- <div class="flex-shrink-0">
          <span :class="getTypeBadgeClass(document.type || document.file_type || 'unknown')" class="px-2 py-0.5 text-xs font-medium rounded">
            {{ (document.type || document.file_type || 'unknown').toUpperCase() }}
          </span>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { FileTextIcon, FileIcon, ImageIcon } from 'lucide-vue-next'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  documents: {
    type: Array,
    default: () => []
  },
  query: {
    type: String,
    default: ''
  },
  projectId: {
    type: [String, Number],
    default: null
  }
})

// Emits
const emit = defineEmits(['select'])

// State
const selectedIndex = ref(0)

// Computed
const filteredDocuments = computed(() => {
  let filtered = props.documents

  // Filter by project if specified
  if (props.projectId) {
    filtered = filtered.filter(doc => doc.projectId == props.projectId)
  }

  // Filter by search query
  if (props.query.trim()) {
    const query = props.query.toLowerCase().trim()
    filtered = filtered.filter(doc => {
      const docName = doc.file_name || ''
      const docCompany = doc.company || doc.metadata?.company || ''
      return docName.toLowerCase().includes(query) ||
             docCompany.toLowerCase().includes(query)
    })
  }

  // Limit to 10 results
  return filtered.slice(0, 10)
})

// Methods
const getDocumentIcon = (type) => {
  const iconMap = {
    pdf: FileTextIcon,
    docx: FileIcon,
    doc: FileIcon,
    txt: FileTextIcon,
    jpg: ImageIcon,
    png: ImageIcon,
    gif: ImageIcon,
    unknown: FileIcon
  }
  return iconMap[type] || FileIcon
}

const getTypeBadgeClass = (type) => {
  const classMap = {
    pdf: 'bg-red-100 text-red-700',
    docx: 'bg-blue-100 text-blue-700',
    doc: 'bg-blue-100 text-blue-700',
    txt: 'bg-gray-100 text-gray-700',
    jpg: 'bg-green-100 text-green-700',
    png: 'bg-green-100 text-green-700',
    gif: 'bg-green-100 text-green-700',
    unknown: 'bg-gray-100 text-gray-700'
  }
  return classMap[type] || 'bg-gray-100 text-gray-700'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Watch for show prop changes to reset selected index
watch(() => props.show, (newShow) => {
  if (newShow) {
    selectedIndex.value = 0
  }
})

// Expose methods for parent component to control selection
const moveUp = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
  }
}

const moveDown = () => {
  if (selectedIndex.value < filteredDocuments.value.length - 1) {
    selectedIndex.value++
  }
}

const selectCurrent = () => {
  console.log('selectCurrent called, selectedIndex:', selectedIndex.value)
  console.log('filteredDocuments:', filteredDocuments.value)
  if (filteredDocuments.value.length > 0 && filteredDocuments.value[selectedIndex.value]) {
    console.log('Selecting document:', filteredDocuments.value[selectedIndex.value])
    emit('select', filteredDocuments.value[selectedIndex.value])
  } else {
    console.log('No document to select or invalid index')
  }
}

defineExpose({
  moveUp,
  moveDown,
  selectCurrent
})
</script>