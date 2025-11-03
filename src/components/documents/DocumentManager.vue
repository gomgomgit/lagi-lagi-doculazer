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
    </div>
    <FileUpload 
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
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
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
import { ref, computed, onMounted, watch } from 'vue'
import { ArrowLeftIcon } from 'lucide-vue-next'
import CardHeader from '@/components/ui/CardHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import FileUpload from '@/components/ui/FileUpload.vue'
import DocumentTable from './DocumentTable.vue'
import { useProjects } from '@/composables/useProjects'

const { projectKnowledges, loading, error, fetchProjectKnowledges } = useProjects()

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
const filterCompanies = ref([])
const filterDateFrom = ref('')
const filterDateTo = ref('')



// Computed
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
    console.log('🔄 Project changed, fetching documents for:', newProject.name)
    fetchProjectKnowledges(newProject.id)
  }
}, {
  deep: true,
  immediate: true
})
</script>