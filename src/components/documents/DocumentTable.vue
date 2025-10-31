<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-lg font-medium doc-manager-title">Uploaded Documents</h3>
        <p class="text-sm doc-manager-subtitle">{{ filteredDocuments.length }} documents found</p>
      </div>
      <BaseButton 
        variant="secondary" 
        size="sm"
        @click="$emit('refresh')"
      >
        <RefreshCwIcon class="w-4 h-4" /> Refresh
      </BaseButton>
    </div>

    <!-- Search and Filter Section -->
    <div class="mb-6 p-4 doc-page-section rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search by filename -->
        <div>
          <label class="block text-sm font-medium mb-1">Search Files</label>
          <div class="relative">
            <input
              :value="searchQuery"
              @input="$emit('update:searchQuery', $event.target.value)"
              type="text"
              placeholder="Search by filename..."
              class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <SearchIcon class="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <!-- Filter by company -->
        <div>
          <label class="block text-sm font-medium mb-1">Company</label>
          <select
            :value="filterCompany"
            @input="$emit('update:filterCompany', $event.target.value)"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Companies</option>
            <option value="PT ABC">PT ABC</option>
            <option value="PT XYZ">PT XYZ</option>
            <option value="CV DEF">CV DEF</option>
          </select>
        </div>

        <!-- Date range filter -->
        <div>
          <label class="block text-sm font-medium mb-1">From Date</label>
          <input
            :value="filterDateFrom"
            @input="$emit('update:filterDateFrom', $event.target.value)"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-1">To Date</label>
          <input
            :value="filterDateTo"
            @input="$emit('update:filterDateTo', $event.target.value)"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>
      
      <!-- Clear filters -->
      <div class="mt-3 flex justify-end">
        <BaseButton 
          variant="ghost" 
          size="sm"
          @click="$emit('clear-filters')"
        >
          <XIcon class="w-4 h-4" /> Clear Filters
        </BaseButton>
      </div>
    </div>

    <!-- Documents Table -->
    <div v-if="filteredDocuments.length > 0" class="doc-page-card border rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="doc-table-header">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium doc-table-header-text">
                <button @click="$emit('sort', 'name')" class="flex items-center gap-1 hover:text-gray-900">
                  File Name
                  <component :is="getSortIcon('name')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-4 py-3 text-left text-sm font-medium doc-table-header-text">
                <button @click="$emit('sort', 'company')" class="flex items-center gap-1 hover:text-gray-900">
                  Company
                  <component :is="getSortIcon('company')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-4 py-3 text-left text-sm font-medium doc-table-header-text">
                <button @click="$emit('sort', 'uploadDate')" class="flex items-center gap-1 hover:text-gray-900">
                  Date
                  <component :is="getSortIcon('uploadDate')" class="w-3 h-3" />
                </button>
              </th>
              <th class="px-4 py-3 text-left text-sm font-medium doc-table-header-text">
                <button @click="$emit('sort', 'size')" class="flex items-center gap-1 hover:text-gray-900">
                  Size
                  <component :is="getSortIcon('size')" class="w-3 h-3" />
                </button>
              </th>
              <!-- <th class="px-4 py-3 text-left text-sm font-medium doc-table-header-text">Type</th> -->
              <th class="px-4 py-3 text-center text-sm font-medium doc-table-header-text">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr 
              v-for="doc in filteredDocuments" 
              :key="doc.id"
              class="doc-table-row transition-colors"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <component :is="getFileIcon(doc.mime)" class="w-5 h-5 text-gray-500" />
                  <span class="font-medium doc-table-text">{{ doc.file_name }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm doc-table-meta">{{ doc.company }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm doc-table-meta">{{ formatDate(doc.file_date) }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="text-sm doc-table-meta">{{ formatFileSize(doc.file_size) }}</span>
              </td>
              <!-- <td class="px-4 py-3">
                <span class="inline-block px-2 py-1 text-xs font-medium rounded-full" :class="getTypeClass(doc.mime)">
                  {{ doc.mime?.toUpperCase() }}
                </span>
              </td> -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-2">
                  <!-- View PDF -->
                  <button
                    v-if="doc.mime === 'application/pdf'"
                    @click="$emit('view-pdf', doc)"
                    class="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                    title="View PDF"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  
                  <!-- Download -->
                  <button
                    @click="$emit('download', doc)"
                    class="p-1 text-green-600 hover:text-green-800 transition-colors"
                    title="Download"
                  >
                    <DownloadIcon class="w-4 h-4" />
                  </button>
                  
                  <!-- Delete -->
                  <button
                    @click="$emit('delete', doc)"
                    class="p-1 text-red-600 hover:text-red-800 transition-colors"
                    title="Delete"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <FileTextIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium doc-table-text mb-2">No documents found</h3>
      <p class="doc-table-meta mb-4">
        {{ searchQuery || filterCompany || filterDateFrom || filterDateTo 
          ? 'No documents match your current filters.' 
          : 'Upload some documents to get started.' }}
      </p>
      <BaseButton 
        v-if="searchQuery || filterCompany || filterDateFrom || filterDateTo"
        variant="outline" 
        size="sm"
        @click="$emit('clear-filters')"
      >
        Clear Filters
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import {
  SearchIcon,
  XIcon,
  RefreshCwIcon,
  EyeIcon,
  DownloadIcon,
  TrashIcon,
  FileTextIcon,
  FileIcon,
  ImageIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon
} from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'

// Props
const props = defineProps({
  filteredDocuments: {
    type: Array,
    required: true
  },
  searchQuery: {
    type: String,
    required: true
  },
  filterCompany: {
    type: String,
    required: true
  },
  filterDateFrom: {
    type: String,
    required: true
  },
  filterDateTo: {
    type: String,
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
defineEmits([
  'update:searchQuery',
  'update:filterCompany', 
  'update:filterDateFrom',
  'update:filterDateTo',
  'clear-filters',
  'sort',
  'refresh',
  'view-pdf',
  'download',
  'delete'
])

// Methods
const getFileIcon = (mime) => {
  const iconMap = {
    'application/pdf': FileTextIcon,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileIcon,
    'application/msword': FileIcon,
    'text/plain': FileTextIcon,
    'image/jpeg': ImageIcon,
    'image/png': ImageIcon,
    'image/gif': ImageIcon
  }
  return iconMap[mime] || FileIcon
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getSortIcon = (field) => {
  if (props.sortField !== field) {
    return ChevronsUpDownIcon
  }
  return props.sortDirection === 'asc' ? ChevronUpIcon : ChevronDownIcon
}
</script>