<template>
  <CardHeader 
    :title="`${selectedProject.name} - Documents`"
    :subtitle="`Manage documents in ${selectedProject.name} project`"
  >
    <template #action>
      <BaseButton variant="secondary" size="sm" @click="$emit('back-to-projects')">
        <ArrowLeftIcon class="w-4 h-4" /> Back to Projects
      </BaseButton>
    </template>
  </CardHeader>
  
  <!-- Upload Section -->
    <div class="mt-6 px-4 doc-page-container">
    <div class="mb-4">
      <h3 class="text-lg font-medium mb-2 doc-manager-title">Upload Documents</h3>
      <p class="text-sm doc-manager-subtitle">
        Upload PDF, DOCX, XLSX, TXT, ZIP files to <strong>{{ selectedProject.name }}</strong> project
      </p>
    </div>
    <FileUpload 
      :multiple="true"
      accept=".pdf,.doc,.docx,.xlsx,.xls,.zip,.rar,.7z,.tar.gz,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip,application/x-rar-compressed,application/x-7z-compressed,text/plain"
      :max-size="200 * 1024 * 1024"
      main-text="Drop documents or archives here or click to browse"
      sub-text="Supports PDF, DOC, DOCX, XLSX, ZIP, RAR, 7Z, TXT files up to 200MB each"
      @files-selected="onFilesSelected"
      @file-error="$emit('file-error', $event)"
    />
    
    <!-- Upload All Progress Bar -->
    <div v-if="isUploadingAll" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-center gap-3 mb-3">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span class="font-medium text-blue-900">Uploading Files...</span>
        <span class="text-sm text-blue-700">{{ uploadingFilesCount }} / {{ totalFilesCount }}</span>
      </div>
      <div class="w-full bg-blue-100 rounded-full h-2">
        <div 
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${totalFilesCount > 0 ? (uploadingFilesCount / totalFilesCount) * 100 : 0}%` }"
        ></div>
      </div>
    </div>

    <!-- Archive Files Info -->
    <div v-if="hasArchiveFiles && !isUploadingAll" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-start gap-3">
        <div class="text-blue-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div>
          <h4 class="font-medium text-blue-900 mb-1">Archive Files Detected</h4>
          <p class="text-sm text-blue-700">
            ZIP, RAR, and other archive files will be automatically extracted during processing. 
            The system will extract and index all supported documents within the archive.
          </p>
        </div>
      </div>
    </div>
    
    <!-- Upload Progress -->
    <div v-if="uploadQueue.length > 0" class="mt-6">
      <div class="flex items-center justify-between mb-3">
        <h4 class="font-medium doc-manager-title">Upload Queue</h4>
        <div class="flex items-center gap-2">
          <span class="text-sm doc-table-meta">{{ pendingFilesCount }} file{{ pendingFilesCount !== 1 ? 's' : '' }} pending</span>
          <BaseButton 
            v-if="pendingFilesCount > 0 && !isUploadingAll"
            variant="primary" 
            size="sm"
            @click="uploadAllFiles"
            class="inline-flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            Upload All
          </BaseButton>
          <BaseButton 
            v-if="isUploadingAll"
            variant="secondary" 
            size="sm"
            @click="cancelUploadAll"
            class="inline-flex items-center gap-2"
          >
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            Uploading... {{ uploadingFilesCount }}/{{ totalFilesCount }}
          </BaseButton>
        </div>
      </div>
      <div class="space-y-2">
        <div 
          v-for="(item, index) in uploadQueue" 
          :key="index"
          class="doc-upload-queue-item flex items-center justify-between p-3 rounded border"
        >
          <div class="flex items-center gap-3 flex-1">
            <div class="text-2xl">{{ getFileTypeInfo(item.file).icon }}</div>
            <div class="flex-1">
              <div class="font-medium doc-table-text">{{ item.file.name }}</div>
              <div class="text-sm doc-table-meta">
                {{ formatFileSize(item.file.size) }}
                <span v-if="isArchiveFile(item.file)" class="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Archive
                </span>
              </div>
              <div v-if="isArchiveFile(item.file)" class="text-xs text-blue-600 mt-1">
                {{ getFileTypeInfo(item.file).description }}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-sm" :class="getStatusClass(item.status)">
              {{ item.status }}
            </div>
            <div class="flex items-center gap-2">
              <BaseButton 
                v-if="item.status === 'pending' && !isUploadingAll"
                variant="primary" 
                size="sm"
                @click="uploadFile(item, index)"
              >
                Upload
              </BaseButton>
              <BaseButton 
                v-if="(item.status === 'pending' || item.status === 'error') && !isUploadingAll"
                variant="danger" 
                size="sm"
                @click="removeFromQueue(index)"
                title="Remove from queue"
              >
                <XIcon class="w-4 h-4" />
              </BaseButton>
              <div 
                v-if="isUploadingAll && currentUploadIndex === index && item.status === 'uploading'"
                class="text-sm text-blue-600 font-medium flex items-center gap-2"
              >
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Uploading...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Documents List -->
  <div class="mt-6 px-4">
    <!-- Loading State -->
    <div v-if="documentsLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p class="doc-table-meta">Loading documents...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="text-red-500 mb-4">
        <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
      </div>
      <p class="text-red-600 font-medium">Failed to load documents</p>
      <p class="doc-table-meta mt-1">{{ error }}</p>
      <BaseButton variant="primary" size="sm" class="mt-4" @click="retryFetch">
        Try Again
      </BaseButton>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="!projectKnowledges || projectKnowledges.length === 0" class="text-center py-12">
      <div class="doc-table-meta mb-4">
        <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      </div>
      <h3 class="text-lg font-medium mb-2 doc-manager-title">No documents yet</h3>
      <p class="doc-table-meta">Start by uploading your first document to this project</p>
    </div>
    
    <!-- Documents Table -->
    <DocumentTable
      v-else
      :filtered-documents="filteredDocuments"
      v-model:search-query="searchQuery"
      v-model:filter-companies="filterCompanies"
      v-model:filter-date-from="filterDateFrom"
      v-model:filter-date-to="filterDateTo"
      :sort-field="sortField"
      :sort-direction="sortDirection"
      @clear-filters="clearFilters"
      @sort="sortBy"
      @refresh="retryFetch"
      @view-pdf="$emit('view-pdf', $event)"
      @download="$emit('download-document', $event)"
      @delete="$emit('confirm-delete', $event)"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ArrowLeftIcon, XIcon } from 'lucide-vue-next'
import CardHeader from '@/components/ui/CardHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import FileUpload from '@/components/ui/FileUpload.vue'
import DocumentTable from './DocumentTable.vue'
import { useProjects } from '@/composables/useProjects'

const { projectKnowledges, documentsLoading, error, fetchProjectKnowledges } = useProjects()

// Props
const props = defineProps({
  selectedProject: {
    type: Object,
    required: true
  },
  uploadQueue: {
    type: Array,
    required: true
  },
  sortField: {
    type: String,
    required: true
  },
  sortDirection: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits([
  'back-to-projects',
  'files-selected',
  'file-error',
  'upload-file',
  'upload-all-files',
  'cancel-upload-all',
  'remove-from-queue',
  'refresh-documents',
  'view-pdf',
  'download-document',
  'confirm-delete',
  'sort-by'
])

// Local state for filters
const searchQuery = ref('')
const filterCompanies = ref([])
const filterDateFrom = ref('')
const filterDateTo = ref('')

// Local state for upload all functionality
const isUploadingAll = ref(false)
const currentUploadIndex = ref(-1)

// Computed
const hasArchiveFiles = computed(() => {
  return props.uploadQueue.some(item => isArchiveFile(item.file))
})

const pendingFilesCount = computed(() => {
  return props.uploadQueue.filter(item => item.status === 'pending').length
})

const uploadingFilesCount = computed(() => {
  return props.uploadQueue.filter(item => item.status === 'uploading' || item.status === 'completed').length
})

const totalFilesCount = computed(() => {
  return props.uploadQueue.filter(item => item.status !== 'error').length
})

const filteredDocuments = computed(() => {
  // Gunakan projectKnowledges dari API sebagai sumber data
  let filtered = [...(projectKnowledges.value || [])]

  // Filter by search query (filename)
  if (searchQuery.value) {
    filtered = filtered.filter(doc => 
      doc.file_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter by companies (check if any selected company matches any company in document's company_names array)
  if (filterCompanies.value && filterCompanies.value.length > 0) {
    filtered = filtered.filter(doc => {
      const docCompanies = doc.knowledge_metadata?.company_names || []
      return filterCompanies.value.some(selectedCompany => 
        docCompanies.includes(selectedCompany)
      )
    })
  }

  // Filter by date range
  if (filterDateFrom.value) {
    filtered = filtered.filter(doc => {
      const docDate = new Date(doc.file_date)
      return docDate >= new Date(filterDateFrom.value)
    })
  }

  if (filterDateTo.value) {
    filtered = filtered.filter(doc => {
      const docDate = new Date(doc.file_date)
      return docDate <= new Date(filterDateTo.value)
    })
  }

  // Sort documents
  if (props.sortField && filtered.length > 0) {
    filtered.sort((a, b) => {
      let aVal = a[props.sortField]
      let bVal = b[props.sortField]
      
      // Handle different data types
      if (props.sortField === 'size') {
        aVal = Number(aVal) || 0
        bVal = Number(bVal) || 0
      } else if (props.sortField === 'uploadDate' || props.sortField === 'created_at') {
        aVal = new Date(aVal || 0)
        bVal = new Date(bVal || 0)
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = (bVal || '').toLowerCase()
      }
      
      if (aVal < bVal) return props.sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return props.sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  return filtered
})

// Methods
const onFilesSelected = (files) => {
  emit('files-selected', files)
}

const uploadFile = (item, index) => {
  emit('upload-file', item, index)
}

const removeFromQueue = (index) => {
  emit('remove-from-queue', index)
}

const uploadAllFiles = () => {
  isUploadingAll.value = true
  currentUploadIndex.value = 0
  emit('upload-all-files')
}

const cancelUploadAll = () => {
  isUploadingAll.value = false
  currentUploadIndex.value = -1
  emit('cancel-upload-all')
}

// Update UI saat upload all progress
const updateUploadAllProgress = (index) => {
  currentUploadIndex.value = index
}

const completeUploadAll = () => {
  isUploadingAll.value = false
  currentUploadIndex.value = -1
}

// Refresh documents method for parent component
const refreshDocuments = async () => {
  if (!props.selectedProject?.id) return
  
  try {
    await fetchProjectKnowledges(props.selectedProject.id)
  } catch (error) {
    console.error('Error refreshing documents:', error)
  }
}

// Expose methods untuk parent component
defineExpose({
  updateUploadAllProgress,
  completeUploadAll,
  refreshDocuments
})

const clearFilters = () => {
  searchQuery.value = ''
  filterCompanies.value = []
  filterDateFrom.value = ''
  filterDateTo.value = ''
}

const sortBy = (field) => {
  emit('sort-by', field)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const isArchiveFile = (file) => {
  const archiveExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz', '.tar.gz']
  const archiveMimeTypes = [
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
    'application/x-compressed'
  ]
  
  const fileName = file.name.toLowerCase()
  const fileType = file.type.toLowerCase()
  
  return archiveExtensions.some(ext => fileName.endsWith(ext)) || 
         archiveMimeTypes.includes(fileType)
}

const getFileTypeInfo = (file) => {
  if (isArchiveFile(file)) {
    return {
      type: 'archive',
      icon: '📦',
      description: 'Archive file - will be extracted during processing'
    }
  }
  
  const extension = file.name.split('.').pop().toLowerCase()
  const fileTypes = {
    pdf: { type: 'document', icon: '📄', description: 'PDF document' },
    doc: { type: 'document', icon: '📝', description: 'Word document' },
    docx: { type: 'document', icon: '📝', description: 'Word document' },
    xlsx: { type: 'spreadsheet', icon: '📊', description: 'Excel spreadsheet' },
    xls: { type: 'spreadsheet', icon: '📊', description: 'Excel spreadsheet' },
    txt: { type: 'text', icon: '📋', description: 'Text file' }
  }
  
  return fileTypes[extension] || { type: 'unknown', icon: '📄', description: 'Document' }
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'doc-status-pending',
    uploading: 'doc-status-uploading',
    completed: 'doc-status-completed',
    error: 'doc-status-error'
  }
  return classes[status] || 'doc-status-pending'
}

const retryFetch = () => {
  if (props.selectedProject?.id) {
    fetchProjectKnowledges(props.selectedProject.id)
  }
}

watch(() => props.selectedProject, (newProject) => {
  if (newProject?.id) {
    fetchProjectKnowledges(newProject.id)
  }
}, {
  deep: true,
  immediate: true
})
</script>