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
        Upload PDF, DOCX, TXT files to <strong>{{ selectedProject.name }}</strong> project
      </p>
    </div>    <FileUpload 
      :multiple="true"
      accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
      :max-size="50 * 1024 * 1024"
      main-text="Drop documents here or click to browse"
      sub-text="Supports PDF, DOC, DOCX, TXT files up to 50MB each"
      @files-selected="onFilesSelected"
      @file-error="$emit('file-error', $event)"
    />
    
    <!-- Upload Progress -->
    <div v-if="uploadQueue.length > 0" class="mt-6">
      <h4 class="font-medium mb-3 doc-manager-title">Upload Queue</h4>
      <div class="space-y-2">
        <div 
          v-for="(item, index) in uploadQueue" 
          :key="index"
          class="doc-upload-queue-item flex items-center justify-between p-3 rounded border"
        >
          <div class="flex-1">
            <div class="font-medium doc-table-text">{{ item.file.name }}</div>
            <div class="text-sm doc-table-meta">{{ formatFileSize(item.file.size) }}</div>
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

  <!-- Documents List -->
  <div class="mt-6 px-4">
    <DocumentTable
      :filtered-documents="filteredDocuments"
      v-model:search-query="searchQuery"
      v-model:filter-company="filterCompany"
      v-model:filter-date-from="filterDateFrom"
      v-model:filter-date-to="filterDateTo"
      :sort-field="sortField"
      :sort-direction="sortDirection"
      @clear-filters="clearFilters"
      @sort="sortBy"
      @refresh="$emit('refresh-documents')"
      @view-pdf="$emit('view-pdf', $event)"
      @download="$emit('download-document', $event)"
      @delete="$emit('confirm-delete', $event)"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowLeftIcon } from 'lucide-vue-next'
import CardHeader from '@/components/ui/CardHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import FileUpload from '@/components/ui/FileUpload.vue'
import DocumentTable from './DocumentTable.vue'

// Props
const props = defineProps({
  selectedProject: {
    type: Object,
    required: true
  },
  documents: {
    type: Array,
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
  'refresh-documents',
  'view-pdf',
  'download-document',
  'confirm-delete',
  'sort-by'
])

// Local state for filters
const searchQuery = ref('')
const filterCompany = ref('')
const filterDateFrom = ref('')
const filterDateTo = ref('')

// Computed
const filteredDocuments = computed(() => {
  let filtered = props.documents

  // Filter by selected project first
  if (props.selectedProject) {
    filtered = filtered.filter(doc => doc.projectId === props.selectedProject.id)
  }

  // Filter by search query (filename)
  if (searchQuery.value) {
    filtered = filtered.filter(doc => 
      doc.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter by company
  if (filterCompany.value) {
    filtered = filtered.filter(doc => doc.company === filterCompany.value)
  }

  // Filter by date range
  if (filterDateFrom.value) {
    filtered = filtered.filter(doc => doc.uploadDate >= filterDateFrom.value)
  }

  if (filterDateTo.value) {
    filtered = filtered.filter(doc => doc.uploadDate <= filterDateTo.value)
  }

  // Sort documents
  filtered.sort((a, b) => {
    let aVal = a[props.sortField]
    let bVal = b[props.sortField]
    
    // Handle different data types
    if (props.sortField === 'size') {
      aVal = Number(aVal)
      bVal = Number(bVal)
    } else if (props.sortField === 'uploadDate') {
      aVal = new Date(aVal)
      bVal = new Date(bVal)
    } else if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }
    
    if (aVal < bVal) return props.sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return props.sortDirection === 'asc' ? 1 : -1
    return 0
  })

  return filtered
})

// Methods
const onFilesSelected = (files) => {
  emit('files-selected', files)
}

const uploadFile = (item, index) => {
  emit('upload-file', item, index)
}

const clearFilters = () => {
  searchQuery.value = ''
  filterCompany.value = ''
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

const getStatusClass = (status) => {
  const classes = {
    pending: 'doc-status-pending',
    uploading: 'doc-status-uploading',
    completed: 'doc-status-completed',
    error: 'doc-status-error'
  }
  return classes[status] || 'doc-status-pending'
}
</script>