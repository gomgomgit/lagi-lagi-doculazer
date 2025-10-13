<template>
  <div class="max-w-2xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">File Upload Demo</h1>
    
    <!-- Basic Upload -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold mb-4">Single File Upload</h2>
      <FileUpload 
        :multiple="false"
        accept="image/*"
        :max-size="5 * 1024 * 1024"
        main-text="Drop image here or click to browse"
        sub-text="Support for JPG, PNG, GIF files up to 5MB"
        @files-selected="onSingleFileSelected"
        @file-error="onFileError"
      />
    </div>

    <!-- Multiple Upload -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold mb-4">Multiple File Upload</h2>
      <FileUpload 
        :multiple="true"
        accept=".pdf,.doc,.docx,.txt"
        :max-size="10 * 1024 * 1024"
        main-text="Drop documents here or click to browse"
        sub-text="Support for PDF, DOC, DOCX, TXT files up to 10MB each"
        @files-selected="onMultipleFilesSelected"
        @file-error="onFileError"
      />
    </div>

    <!-- Disabled State -->
    <div class="mb-8">
      <h2 class="text-lg font-semibold mb-4">Disabled Upload</h2>
      <FileUpload 
        :disabled="true"
        main-text="Upload is currently disabled"
        sub-text="This upload area is disabled for demonstration"
      />
    </div>

    <!-- Results -->
    <div v-if="uploadResults.length > 0" class="mt-8">
      <h2 class="text-lg font-semibold mb-4">Upload Results</h2>
      <div class="space-y-2">
        <div 
          v-for="(result, index) in uploadResults" 
          :key="index"
          class="p-3 bg-gray-50 rounded border"
        >
          <div class="font-medium">{{ result.name }}</div>
          <div class="text-sm text-gray-600">
            Size: {{ formatFileSize(result.size) }} | 
            Type: {{ result.type }}
          </div>
        </div>
      </div>
      
      <BaseButton 
        variant="secondary" 
        size="sm" 
        class="mt-4"
        @click="clearResults"
      >
        Clear Results
      </BaseButton>
    </div>

    <!-- Error Messages -->
    <div v-if="errorMessages.length > 0" class="mt-8">
      <h2 class="text-lg font-semibold mb-4 text-red-600">Errors</h2>
      <div class="space-y-1">
        <div 
          v-for="(error, index) in errorMessages" 
          :key="index"
          class="text-sm text-red-600 p-2 bg-red-50 rounded border border-red-200"
        >
          {{ error }}
        </div>
      </div>
      
      <BaseButton 
        variant="secondary" 
        size="sm" 
        class="mt-4"
        @click="clearErrors"
      >
        Clear Errors
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FileUpload from '@/components/ui/FileUpload.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

// Reactive data
const uploadResults = ref([])
const errorMessages = ref([])

// File upload handlers
const onSingleFileSelected = (files) => {
  console.log('Single file selected:', files)
  uploadResults.value = files.map(file => ({
    name: file.name,
    size: file.size,
    type: file.type
  }))
}

const onMultipleFilesSelected = (files) => {
  console.log('Multiple files selected:', files)
  const newResults = files.map(file => ({
    name: file.name,
    size: file.size,
    type: file.type
  }))
  uploadResults.value.push(...newResults)
}

const onFileError = (errors) => {
  console.error('File upload errors:', errors)
  errorMessages.value.push(...errors)
}

const clearResults = () => {
  uploadResults.value = []
}

const clearErrors = () => {
  errorMessages.value = []
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>