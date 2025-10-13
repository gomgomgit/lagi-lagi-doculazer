<template>
  <div 
    ref="dropZone"
    :class="dropZoneClasses"
    @drop.prevent="onDrop"
    @dragover.prevent="onDragOver"
    @dragenter.prevent="onDragEnter"
    @dragleave.prevent="onDragLeave"
    @click="triggerFileInput"
  >
    <input
      ref="fileInput"
      type="file"
      :multiple="multiple"
      :accept="accept"
      class="hidden"
      @change="onFileSelect"
    />
    
    <div class="text-center">
      <!-- Upload Icon -->
      <component 
        :is="UploadIcon" 
        :size="iconSize"
        :class="iconClasses"
        class="mx-auto mb-3"
      />
      
      <!-- Main Text -->
      <p class="text-base font-medium mb-2" :class="textClasses">
        {{ isDragOver ? dragText : mainText }}
      </p>
      
      <!-- Sub Text -->
      <p class="text-sm opacity-70" :class="textClasses">
        {{ subText }}
      </p>
      
      <!-- File Info -->
      <div v-if="selectedFiles.length > 0" class="mt-4 text-left">
        <p class="text-sm font-medium mb-2">Selected files:</p>
        <div class="space-y-1">
          <div 
            v-for="(file, index) in selectedFiles" 
            :key="index"
            class="flex items-center justify-between text-sm p-2 bg-gray-50 rounded border"
          >
            <span class="truncate flex-1 mr-2">{{ file.name }}</span>
            <span class="text-gray-500 text-xs">{{ formatFileSize(file.size) }}</span>
            <button
              @click.stop="removeFile(index)"
              class="ml-2 text-red-500 hover:text-red-700 transition-colors"
            >
              <component :is="XIcon" :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Upload as UploadIcon, X as XIcon } from 'lucide-vue-next'

// Props
const props = defineProps({
  // Multiple file selection
  multiple: {
    type: Boolean,
    default: false
  },
  // Accepted file types
  accept: {
    type: String,
    default: '*/*'
  },
  // Maximum file size in bytes
  maxSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB default
  },
  // Custom text
  mainText: {
    type: String,
    default: 'Drop files here or click to browse'
  },
  dragText: {
    type: String,
    default: 'Drop files here'
  },
  subText: {
    type: String,
    default: 'Support for multiple files upload'
  },
  // Icon size
  iconSize: {
    type: [String, Number],
    default: 48
  },
  // Disabled state
  disabled: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['files-selected', 'file-error'])

// Reactive data
const isDragOver = ref(false)
const selectedFiles = ref([])
const fileInput = ref(null)
const dropZone = ref(null)

// Computed classes
const dropZoneClasses = computed(() => {
  const baseClasses = 'border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer'
  
  if (props.disabled) {
    return `${baseClasses} border-gray-200 bg-gray-50 cursor-not-allowed opacity-50`
  }
  
  if (isDragOver.value) {
    return `${baseClasses} border-orange bg-orange/5 border-solid`
  }
  
  return `${baseClasses} border-gray-300 hover:border-orange hover:bg-orange/5`
})

const iconClasses = computed(() => {
  if (props.disabled) return 'text-gray-400'
  return isDragOver.value ? 'text-orange' : 'text-gray-400'
})

const textClasses = computed(() => {
  if (props.disabled) return 'text-gray-400'
  return isDragOver.value ? 'text-orange' : 'text-gray-600'
})

// Methods
const triggerFileInput = () => {
  if (!props.disabled) {
    fileInput.value?.click()
  }
}

const onDragEnter = (e) => {
  if (props.disabled) return
  e.preventDefault()
  isDragOver.value = true
}

const onDragOver = (e) => {
  if (props.disabled) return
  e.preventDefault()
}

const onDragLeave = (e) => {
  if (props.disabled) return
  e.preventDefault()
  // Only set to false if we're leaving the dropzone completely
  if (!dropZone.value?.contains(e.relatedTarget)) {
    isDragOver.value = false
  }
}

const onDrop = (e) => {
  if (props.disabled) return
  e.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(e.dataTransfer.files)
  handleFiles(files)
}

const onFileSelect = (e) => {
  if (props.disabled) return
  const files = Array.from(e.target.files)
  handleFiles(files)
}

const handleFiles = (files) => {
  const validFiles = []
  const errors = []
  
  for (const file of files) {
    // Check file size
    if (file.size > props.maxSize) {
      errors.push(`${file.name}: File size exceeds ${formatFileSize(props.maxSize)}`)
      continue
    }
    
    // Check file type if accept is specified and not wildcard
    if (props.accept !== '*/*') {
      const acceptedTypes = props.accept.split(',').map(type => type.trim())
      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase())
        } else if (type.includes('/*')) {
          const mimeCategory = type.split('/')[0]
          return file.type.startsWith(mimeCategory)
        } else {
          return file.type === type
        }
      })
      
      if (!isValidType) {
        errors.push(`${file.name}: File type not supported`)
        continue
      }
    }
    
    validFiles.push(file)
  }
  
  // Handle errors
  if (errors.length > 0) {
    emit('file-error', errors)
  }
  
  // Handle valid files
  if (validFiles.length > 0) {
    if (props.multiple) {
      selectedFiles.value = [...selectedFiles.value, ...validFiles]
    } else {
      selectedFiles.value = [validFiles[0]]
    }
    
    emit('files-selected', validFiles)
  }
  
  // Clear input value to allow re-selecting the same file
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
  emit('files-selected', selectedFiles.value)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Expose methods for parent components
defineExpose({
  clearFiles: () => {
    selectedFiles.value = []
  },
  getFiles: () => selectedFiles.value
})
</script>