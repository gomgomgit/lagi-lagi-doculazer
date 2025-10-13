<template>
  <div class="w-full">
    <!-- Select Project Before Managing Documents -->
    <div>
      <CardHeader 
        title="Project List" 
        subtitle="Manage documents by Project" 
      >
        <template #action>
          <BaseButton variant="primary" size="sm" class="flex items-center gap-2">
            <FolderPlusIcon class="w-4 h-4" /> Add New Project
          </BaseButton>
        </template>    
      </CardHeader>
      <div>
        <div class="p-4 border-b border-gray-200 flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition-colors">
          <FolderClosedIcon /> Project Satu
        </div>
        <div class="p-4 border-b border-gray-200 flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition-colors">
          <FolderClosedIcon /> Project Dua
        </div>
        <div class="p-4 border-b border-gray-200 flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition-colors">
          <FolderClosedIcon /> Project Tigaa
        </div>
      </div>
    </div>
    <div class="mt-6">
      <CardHeader 
        title="Project Satu Documents" 
        subtitle="Manage documents in Project Satu project" 
      >
        <template #action>
          <BaseButton variant="primary" size="sm">
            <ArrowLeftIcon class="w-4 h-4" /> Back to Projects
          </BaseButton>
        </template>
      </CardHeader>
      <div class="mt-6 px-4">
        <div class="mb-4">
          <h3 class="text-lg font-medium mb-2">Upload Documents</h3>
          <p class="text-sm text-gray-600">Upload PDF, DOCX, XLSX, ZIP files to this project</p>
        </div>
        
        <FileUpload 
          :multiple="true"
          accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          :max-size="50 * 1024 * 1024"
          main-text="Drop documents here or click to browse"
          sub-text="Supports PDF, DOC, DOCX, TXT files up to 50MB each"
          @files-selected="onFilesSelected"
          @file-error="onFileError"
        />
        
        <!-- Upload Progress (jika ada files yang dipilih) -->
        <div v-if="uploadQueue.length > 0" class="mt-6">
          <h4 class="font-medium mb-3">Upload Queue</h4>
          <div class="space-y-2">
            <div 
              v-for="(item, index) in uploadQueue" 
              :key="index"
              class="flex items-center justify-between p-3 bg-gray-50 rounded border"
            >
              <div class="flex-1">
                <div class="font-medium">{{ item.file.name }}</div>
                <div class="text-sm text-gray-500">{{ formatFileSize(item.file.size) }}</div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-sm" :class="getStatusClass(item.status)">
                  {{ item.status }}
                </div>
                <BaseButton 
                  v-if="item.status === 'pending'"
                  variant="primary" 
                  size="sm"
                  @click="uploadFile(item, index)"
                >
                  Upload
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-6 px-4">
        <h3 class="text-lg font-medium mb-2">Uploaded Documents</h3>
        <p class="text-sm text-gray-600">List of documents uploaded to this project will appear here.</p>
        <!-- Placeholder for uploaded documents list -->
        <div class="mt-4 p-4 border border-dashed border-gray-300 rounded text-center text-gray-500">
          No documents uploaded yet.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowLeftIcon, FolderClosedIcon, FolderPlusIcon } from 'lucide-vue-next';
import CardHeader from '@/components/ui/CardHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import FileUpload from '@/components/ui/FileUpload.vue'
import { useAuthStore } from '@/stores/auth'

// State untuk file upload
const uploadQueue = ref([])

// File upload handlers
const onFilesSelected = (files) => {
  console.log('Files selected:', files)
  
  // Add files to upload queue
  const newItems = files.map(file => ({
    file,
    status: 'pending', // pending, uploading, completed, error
    progress: 0,
    error: null
  }))
  
  uploadQueue.value.push(...newItems)
}

const onFileError = (errors) => {
  console.error('File upload errors:', errors)
  // You can show these errors to the user via toast/notification
  errors.forEach(error => {
    console.error(error)
  })
}

const uploadFile = async (item, index) => {
  try {
    // Update status to uploading
    uploadQueue.value[index].status = 'uploading'
    
    // Create FormData
    const formData = new FormData()
    formData.append('file', item.file)
    formData.append('project_id', 'project_satu') // Replace with actual project ID
    
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      uploadQueue.value[index].progress = progress
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // TODO: Replace with actual API call
    // const response = await api.uploadDocument(formData)
    
    // Update status to completed
    uploadQueue.value[index].status = 'completed'
    console.log(`File ${item.file.name} uploaded successfully`)
    
  } catch (error) {
    uploadQueue.value[index].status = 'error'
    uploadQueue.value[index].error = error.message
    console.error('Upload failed:', error)
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'text-gray-500',
    uploading: 'text-blue-500',
    completed: 'text-green-500',
    error: 'text-red-500'
  }
  return classes[status] || 'text-gray-500'
}
</script>