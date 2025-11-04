<script setup lang="ts">
import ContextView from '../../components/context/ContextView.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { CircleXIcon, EyeIcon, SlidersHorizontalIcon, SquareXIcon, SearchIcon, CalendarIcon, BuildingIcon, FilterIcon, XIcon, FilesIcon, BrainIcon } from 'lucide-vue-next';
import { ref, computed } from 'vue';

// Props
const props = defineProps({
  documents: {
    type: Array,
    default: () => []
  }
});

// View mode state
const viewMode = ref('tools'); // 'tools' | 'context'

// Active tab state (for tools mode)
const activeTab = ref('files'); // 'files' | 'context'

// Filter modal state
const showFilterModal = ref(false)

// Draft filter state (edited by user, not yet applied)
const filterFilename = ref('')
const filterStartDate = ref('')
const filterEndDate = ref('')
const filterCompanies = ref<string[]>([])
const filterTags = ref<string[]>([])

// Applied filter state (actually used for filtering)
const appliedFilename = ref('')
const appliedStartDate = ref('')
const appliedEndDate = ref('')
const appliedCompanies = ref<string[]>([])
const appliedTags = ref<string[]>([])

// Company filter input state
const companySearchQuery = ref('')
const showCompanySuggestions = ref(false)
const companyInput = ref<HTMLInputElement | null>(null)

// Tag filter input state
const tagSearchQuery = ref('')
const showTagSuggestions = ref(false)
const tagInput = ref<HTMLInputElement | null>(null)

// Files data from API
const files = computed(() => {
  return props.documents.map((doc: any) => {
    // Extract file extension from filename
    const fileExtension = doc.file_name ? doc.file_name.split('.').pop()?.toLowerCase() : 'unknown'
    
    // Get company names from knowledge_metadata or fallback to old structure
    const companyNames = doc.knowledge_metadata?.company_names || []
    const company = companyNames.length > 0 ? companyNames[0] : (doc.company || 'No Company')
    
    // Use content_date if available, otherwise use file_date
    const documentDate = doc.knowledge_metadata?.content_date || doc.file_date
    
    return {
      knowledge_source_id: doc.knowledge_source_id || doc.knowledge_metadata?.knowledge_source_id,
      file_name: doc.file_name || 'Unknown File',
      date: documentDate ? new Date(documentDate).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US'),
      company: company,
      companies: companyNames, // Keep all company names for advanced filtering
      keywords: doc.knowledge_metadata?.keywords || [],
      type: fileExtension || 'unknown'
    }
  })
})

// Available companies for filter
const availableCompanies = computed(() => {
  const companies = new Set<string>()
  files.value.forEach((file: any) => {
    // Add primary company
    if (file.company && file.company !== 'No Company') {
      companies.add(file.company)
    }
    // Add all companies from companies array
    if (file.companies && Array.isArray(file.companies)) {
      file.companies.forEach((company: string) => {
        if (company && company.trim() !== '') {
          companies.add(company)
        }
      })
    }
  })
  return Array.from(companies).sort()
})

// Available keywords/tags for filter
const availableKeywords = computed(() => {
  const keywords = new Set<string>()
  files.value.forEach((file: any) => {
    if (file.keywords && Array.isArray(file.keywords)) {
      file.keywords.forEach((keyword: string) => {
        if (keyword && keyword.trim() !== '') {
          keywords.add(keyword)
        }
      })
    }
  })
  return Array.from(keywords).sort()
})

// Filtered company suggestions based on search query
const filteredCompanySuggestions = computed(() => {
  if (!companySearchQuery.value) {
    return availableCompanies.value
  }
  
  const query = companySearchQuery.value.toLowerCase()
  return availableCompanies.value.filter(company => 
    company.toLowerCase().includes(query)
  )
})

// Filtered tag suggestions based on search query
const filteredTagSuggestions = computed(() => {
  if (!tagSearchQuery.value) {
    return availableKeywords.value
  }
  
  const query = tagSearchQuery.value.toLowerCase()
  return availableKeywords.value.filter(tag => 
    tag.toLowerCase().includes(query)
  )
})

// Filtered files based on applied filters
const filteredFiles = computed(() => {
  let filtered = files.value

  // Filter by filename
  if (appliedFilename.value.trim()) {
    const keyword = appliedFilename.value.toLowerCase()
    filtered = filtered.filter(file => {
      // Search in filename
      if (file.file_name.toLowerCase().includes(keyword)) return true

      return false
    })
  }

  // Filter by date range
  if (appliedStartDate.value || appliedEndDate.value) {
    filtered = filtered.filter(file => {
      const fileDate = new Date(file.date).toLocaleDateString('en-US')
      const startDate = appliedStartDate.value ? new Date(appliedStartDate.value).toLocaleDateString('en-US') : null
      const endDate = appliedEndDate.value ? new Date(appliedEndDate.value).toLocaleDateString('en-US') : null
      
      if (startDate && fileDate <= startDate) return false
      if (endDate && fileDate >= endDate) return false
      
      return true
    })
  }

  // Filter by companies (multiple selection)
  if (appliedCompanies.value.length > 0) {
    filtered = filtered.filter(file => {
      // Check if any selected company matches primary company
      if (appliedCompanies.value.includes(file.company)) return true
      
      // Check if any selected company is in companies array
      if (file.companies && file.companies.some((company: string) => 
        appliedCompanies.value.includes(company)
      )) return true
      
      return false
    })
  }

  // Filter by tags/keywords (multiple selection)
  if (appliedTags.value.length > 0) {
    filtered = filtered.filter(file => {
      if (file.keywords && file.keywords.some((keyword: string) => 
        appliedTags.value.includes(keyword)
      )) return true
      return false
    })
  }

  return filtered
})

// Computed applied filters
const appliedFilters = computed(() => {
  const filters = []
  if (appliedFilename.value) {
    filters.push({ type: 'filename', label: `Filename: ${appliedFilename.value}`, value: appliedFilename.value })
  }
  if (appliedStartDate.value || appliedEndDate.value) {
    const dateRange = `${appliedStartDate.value || 'Start'} - ${appliedEndDate.value || 'End'}`
    filters.push({ type: 'date', label: `Date: ${dateRange}`, value: `${appliedStartDate.value},${appliedEndDate.value}` })
  }
  if (appliedCompanies.value.length > 0) {
    appliedCompanies.value.forEach(company => {
      filters.push({ type: 'company', label: `Company: ${company}`, value: company })
    })
  }
  if (appliedTags.value.length > 0) {
    appliedTags.value.forEach(tag => {
      filters.push({ type: 'tag', label: `Tag: ${tag}`, value: tag })
    })
  }
  return filters
})

// Methods
const setActiveTab = (tab: string) => {
  activeTab.value = tab
}

const toggleViewMode = () => {
  // No longer needed, removing toggle functionality
  // viewMode will be controlled by tabs
}

const openFilterModal = () => {
  showFilterModal.value = true
}

const closeFilterModal = () => {
  showFilterModal.value = false
}

const removeFilter = (filterType: string, filterValue?: string) => {
  switch (filterType) {
    case 'filename':
      filterFilename.value = ''
      appliedFilename.value = ''
      break
    case 'date':
      filterStartDate.value = ''
      filterEndDate.value = ''
      appliedStartDate.value = ''
      appliedEndDate.value = ''
      break
    case 'company':
      if (filterValue) {
        filterCompanies.value = filterCompanies.value.filter(company => company !== filterValue)
        appliedCompanies.value = appliedCompanies.value.filter(company => company !== filterValue)
      } else {
        filterCompanies.value = []
        appliedCompanies.value = []
      }
      break
    case 'tag':
      if (filterValue) {
        filterTags.value = filterTags.value.filter(tag => tag !== filterValue)
        appliedTags.value = appliedTags.value.filter(tag => tag !== filterValue)
      } else {
        filterTags.value = []
        appliedTags.value = []
      }
      break
  }
}

const clearAllFilters = () => {
  // Clear draft filters
  filterFilename.value = ''
  filterStartDate.value = ''
  filterEndDate.value = ''
  filterCompanies.value = []
  filterTags.value = []
  companySearchQuery.value = ''
  tagSearchQuery.value = ''
  showCompanySuggestions.value = false
  showTagSuggestions.value = false
  
  // Clear applied filters
  appliedFilename.value = ''
  appliedStartDate.value = ''
  appliedEndDate.value = ''
  appliedCompanies.value = []
  appliedTags.value = []
  
  // Close modal
  closeFilterModal()
}

// Company filter methods
const addCompanyFilter = (company: string) => {
  if (!filterCompanies.value.includes(company)) {
    filterCompanies.value.push(company)
  }
  companySearchQuery.value = ''
  showCompanySuggestions.value = false
}

const removeCompanyFilter = (company: string) => {
  filterCompanies.value = filterCompanies.value.filter(c => c !== company)
}

const focusCompanyInput = () => {
  companyInput.value?.focus()
}

// Tag filter methods
const addTagFilter = (tag: string) => {
  if (!filterTags.value.includes(tag)) {
    filterTags.value.push(tag)
  }
  tagSearchQuery.value = ''
  showTagSuggestions.value = false
}

const removeTagFilter = (tag: string) => {
  filterTags.value = filterTags.value.filter(t => t !== tag)
}

const focusTagInput = () => {
  tagInput.value?.focus()
}

// Define emits
const emit = defineEmits(['filtersApplied', 'filtersChanged'])

const applyFilters = () => {
  // Copy draft filters to applied filters
  appliedFilename.value = filterFilename.value
  appliedStartDate.value = filterStartDate.value
  appliedEndDate.value = filterEndDate.value
  appliedCompanies.value = [...filterCompanies.value]
  appliedTags.value = [...filterTags.value]
  
  console.log('Applying filters:', {
    filename: appliedFilename.value,
    dateRange: { start: appliedStartDate.value, end: appliedEndDate.value },
    companies: appliedCompanies.value,
    tags: appliedTags.value
  })
  
  // Close filter modal
  closeFilterModal()
  
  // Emit filtered results to parent component
  emit('filtersApplied', {
    filteredFiles: filteredFiles.value,
    appliedFilters: appliedFilters.value,
    filterCount: appliedFilters.value.length
  })
  
  console.log('Emitted filtered files to parent:', filteredFiles.value)
}

// Utility function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Expose filtered files and filter functions to parent component
defineExpose({
  filteredFiles,
  appliedFilters,
  filterFilename,
  filterStartDate,
  filterEndDate,
  filterCompanies,
  filterTags,
  clearAllFilters,
  applyFilters
})
</script>

<template>
  <!-- Additional Sidebar (Tools/Context) -->
  <aside class="w-80 base-card bg-card flex flex-col h-full overflow-hidden relative">
    <!-- Header with Tab Navigation -->
    <div class="border-b chat-tool-border flex-shrink-0">
      <!-- Tab Navigation -->
      <div class="flex gap-1 text-sm">
        <button 
          @click="setActiveTab('files')"
          class="px-3 py-2 rounded-t-lg transition-colors chat-tool-tab"
          :class="activeTab === 'files' ? 'active border-b-2' : ''"
        >
          <FilesIcon class="w-4 h-4 inline mr-1" />
          Files
        </button>
        <button 
          @click="setActiveTab('context')"
          class="px-3 py-2 rounded-t-lg transition-colors chat-tool-tab"
          :class="activeTab === 'context' ? 'active border-b-2' : ''"
        >
          <BrainIcon class="w-4 h-4 inline mr-1" />
          Context
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto">
      <!-- Files Tab -->
      <div v-if="activeTab === 'files'" class="pt-4">
        <div class="space-y-3">
          <div 
            v-for="file in filteredFiles" 
            :key="file.knowledge_source_id"
            class="p-3 border rounded-lg transition-colors chat-tool-file"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-sm truncate chat-tool-file-title">{{ file.file_name }}</h4>
                <div class="mt-1 text-xs chat-tool-file-meta">
                  <div class="flex items-center gap-1 mb-1">
                    <BuildingIcon class="w-3 h-3" />
                    <span>{{ file.company }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <CalendarIcon class="w-3 h-3" />
                    <span>{{ file.date }}</span>    
                  </div>
                </div>
                
                <!-- Keywords tags -->
                <div v-if="file.keywords && file.keywords.length > 0" class="flex flex-wrap gap-1 mt-2">
                  <span 
                    v-for="keyword in file.keywords.slice(0, 3)" 
                    :key="keyword"
                    class="px-1 py-0.2 text-xs rounded-full bg-blue-100 text-blue-700"
                  >
                    {{ keyword }}
                  </span>
                  <span 
                    v-if="file.keywords.length > 3"
                    class="px-1 py-0.2 text-xs rounded-full bg-gray-100 text-gray-600"
                  >
                    +{{ file.keywords.length - 3 }}
                  </span>
                </div>
              </div>
              <button class="p-1 rounded chat-tool-file-action">
                <EyeIcon class="w-4 h-4 chat-tool-file-meta" />
              </button>
            </div>
          </div>
          
          <!-- Empty state for files -->
          <div v-if="filteredFiles.length === 0" class="text-center py-8 chat-tool-empty">
            <p class="text-sm">{{ files.length === 0 ? 'No documents available' : 'No documents match the current filters' }}</p>
          </div>
        </div>
      </div>

      <!-- Context View Tab -->
      <div v-else-if="activeTab === 'context'">
        <ContextView />
      </div>
    </div>

    <!-- Applied Filters Footer -->
    <div v-if="activeTab === 'files' && appliedFilters.length > 0" class="border-t chat-tool-border p-3 flex-shrink-0">
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-medium text-sm chat-tool-header-title">Applied Filters</h4>
        <button 
          @click="clearAllFilters"
          class="text-xs chat-tool-clear"
        >
          Clear All
        </button>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <span 
          v-for="filter in appliedFilters" 
          :key="`${filter.type}-${filter.value}`"
          class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full chat-tool-filter-badge"
        >
          {{ filter.label }}
          <button 
            @click="removeFilter(filter.type, filter.value)"
            class="rounded-full p-0.5"
          >
            <XIcon class="w-3 h-3" />
          </button>
        </span>
      </div>
    </div>
    
    <!-- Filter Button (Fixed at bottom of Files tab) -->
    <div v-if="activeTab === 'files'" class="border-t chat-tool-border p-3 flex-shrink-0">
      <BaseButton 
        @click="openFilterModal"
        variant="primary"
        size="md" 
        class="w-full justify-center gap-2"
      >
        <SlidersHorizontalIcon class="w-4 h-4" />
        <span>Filters</span>
        <span v-if="appliedFilters.length > 0" class="ml-1 px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs font-semibold">
          {{ appliedFilters.length }}
        </span>
      </BaseButton>
    </div>

    <!-- Filter Modal Overlay -->
    <div 
      v-if="showFilterModal"
      class="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="closeFilterModal"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="font-semibold text-lg">Filter Documents</h3>
          <button 
            @click="closeFilterModal"
            class="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Content (Scrollable) -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Filename Filter -->
          <div>
            <label class="block text-sm font-medium mb-2 chat-tool-form-label">
              <SearchIcon class="w-4 h-4 inline mr-1" />
              Search Filename
            </label>
            <input
              v-model="filterFilename"
              type="text"
              placeholder="Enter filename to search..."
              class="w-full px-3 py-2 border rounded-lg text-sm chat-tool-form-input"
            />
          </div>

          <!-- Date Range Filter -->
          <div>
            <label class="block text-sm font-medium mb-2 chat-tool-form-label">
              <CalendarIcon class="w-4 h-4 inline mr-1" />
              Date Range
            </label>
            <div class="space-y-2">
              <div>
                <span class="text-xs my-1 block chat-tool-file-meta">From :</span>
                <input
                  v-model="filterStartDate"
                  type="date"
                  class="w-full px-3 py-2 border rounded-lg text-sm chat-tool-form-input"
                />
              </div>
              <div>
                <span class="text-xs my-1 block chat-tool-file-meta">To :</span>
                <input
                  v-model="filterEndDate"
                  type="date"
                  class="w-full px-3 py-2 border rounded-lg text-sm chat-tool-form-input"
                />
              </div>
            </div>
          </div>

          <!-- Company Filter (Multiple Selection) -->
          <div>
            <label class="block text-sm font-medium mb-2 chat-tool-form-label">
              <BuildingIcon class="w-4 h-4 inline mr-1" />
              Companies ({{ filterCompanies.length }} selected)
            </label>
            
            <!-- Input field with badges inside -->
            <div 
              @click="focusCompanyInput"
              class="w-full min-h-[38px] px-2 py-1.5 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white cursor-text chat-tool-form-input"
            >
              <div class="flex flex-wrap gap-1 items-center">
                <!-- Selected companies badges inside input -->
                <span 
                  v-for="company in filterCompanies" 
                  :key="company"
                  class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {{ company }}
                  <button
                    @click.stop="removeCompanyFilter(company)"
                    class="hover:bg-blue-200 rounded-full p-0.5"
                    type="button"
                  >
                    <XIcon class="w-3 h-3" />
                  </button>
                </span>
                
                <!-- Input field -->
                <input
                  ref="companyInput"
                  v-model="companySearchQuery"
                  @focus="showCompanySuggestions = true"
                  @input="showCompanySuggestions = true"
                  type="text"
                  placeholder="Type to search companies..."
                  class="flex-1 min-w-[120px] outline-none border-none text-sm p-0 bg-transparent"
                />
              </div>
            </div>
            
            <!-- Suggestions dropdown -->
            <div 
              v-if="showCompanySuggestions && filteredCompanySuggestions.length > 0"
              class="relative z-10 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              <div
                v-for="company in filteredCompanySuggestions"
                :key="company"
                @click="addCompanyFilter(company)"
                class="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm flex items-center justify-between"
              >
                <span>{{ company }}</span>
                <span 
                  v-if="filterCompanies.includes(company)"
                  class="text-blue-600 text-xs"
                >
                  ✓ Selected
                </span>
              </div>
            </div>
          </div>

          <!-- Keywords/Tags Filter (Multiple Selection) -->
          <div>
            <label class="block text-sm font-medium mb-2 chat-tool-form-label">
              <SlidersHorizontalIcon class="w-4 h-4 inline mr-1" />
              Keywords/Tags ({{ filterTags.length }} selected)
            </label>
            
            <!-- Input field with badges inside -->
            <div 
              @click="focusTagInput"
              class="w-full min-h-[38px] px-2 py-1.5 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white cursor-text chat-tool-form-input"
            >
              <div class="flex flex-wrap gap-1 items-center">
                <!-- Selected tags badges inside input -->
                <span 
                  v-for="tag in filterTags" 
                  :key="tag"
                  class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  {{ tag }}
                  <button
                    @click.stop="removeTagFilter(tag)"
                    class="hover:bg-green-200 rounded-full p-0.5"
                    type="button"
                  >
                    <XIcon class="w-3 h-3" />
                  </button>
                </span>
                
                <!-- Input field -->
                <input
                  ref="tagInput"
                  v-model="tagSearchQuery"
                  @focus="showTagSuggestions = true"
                  @input="showTagSuggestions = true"
                  type="text"
                  placeholder="Type to search keywords/tags..."
                  class="flex-1 min-w-[120px] outline-none border-none text-sm p-0 bg-transparent"
                />
              </div>
            </div>
            
            <!-- Suggestions dropdown -->
            <div 
              v-if="showTagSuggestions && filteredTagSuggestions.length > 0"
              class="relative z-10 mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              <div
                v-for="tag in filteredTagSuggestions"
                :key="tag"
                @click="addTagFilter(tag)"
                class="px-3 py-2 hover:bg-green-50 cursor-pointer text-sm flex items-center justify-between"
              >
                <span>{{ tag }}</span>
                <span 
                  v-if="filterTags.includes(tag)"
                  class="text-green-600 text-xs"
                >
                  ✓ Selected
                </span>
              </div>
            </div>
          </div>

          <!-- Filter Actions -->
          <div class="flex gap-2 pt-2">
            <BaseButton 
              @click="applyFilters"
              variant="primary"
              size="sm" 
              class="flex-1 justify-center"
            >
              Apply Filters
            </BaseButton>
            <BaseButton 
              @click="clearAllFilters"
              variant="danger" 
              size="sm"
            >
              Clear
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>