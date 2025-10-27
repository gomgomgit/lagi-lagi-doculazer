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
const activeTab = ref('files'); // 'files' | 'filter'

// Filter state
const filterKeyword = ref('')
const filterStartDate = ref('')
const filterEndDate = ref('')
const filterCompany = ref('')

// Files data from API
const files = computed(() => {
  return props.documents.map((doc: any) => {
    // Extract file extension from filename
    const fileExtension = doc.file_name ? doc.file_name.split('.').pop()?.toLowerCase() : 'unknown'
    return {
      knowledge_source_id: doc.knowledge_source_id,
      file_name: doc.file_name || 'Unknown File',
      date: doc.file_date ? new Date(doc.file_date).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US'),
      company: doc.company || 'No Company',
      type: fileExtension || 'unknown'
    }
  })
})

// Available companies for filter
const availableCompanies = computed(() => {
  const companies = new Set<string>()
  props.documents.forEach((doc: any) => {
    const company = doc.company || doc.metadata?.company
    if (company && company !== 'No Company') {
      companies.add(company)
    }
  })
  return Array.from(companies).sort()
})

// Filtered files based on applied filters
const filteredFiles = computed(() => {
  let filtered = files.value

  // Filter by keyword
  if (filterKeyword.value.trim()) {
    const keyword = filterKeyword.value.toLowerCase()
    filtered = filtered.filter(file => 
      file.file_name.toLowerCase().includes(keyword) ||
      file.company.toLowerCase().includes(keyword)
    )
  }

  // Filter by date range
  if (filterStartDate.value || filterEndDate.value) {
    filtered = filtered.filter(file => {
      const fileDate = new Date(file.date).toLocaleDateString('en-US')
      const startDate = filterStartDate.value ? new Date(filterStartDate.value).toLocaleDateString('en-US') : null
      const endDate = filterEndDate.value ? new Date(filterEndDate.value).toLocaleDateString('en-US') : null
      console.log('file:', file)
      console.log('start:', startDate)
      console.log('end:', endDate)
      console.log('Filtering:', fileDate)
      
      if (startDate && fileDate <= startDate) return false
      if (endDate && fileDate >= endDate) return false
      
      return true
    })
  }

  // Filter by company
  if (filterCompany.value) {
    filtered = filtered.filter(file => file.company === filterCompany.value)
  }

  return filtered
})

// Computed applied filters
const appliedFilters = computed(() => {
  const filters = []
  if (filterKeyword.value) {
    filters.push({ type: 'keyword', label: `Keyword: ${filterKeyword.value}`, value: filterKeyword.value })
  }
  if (filterStartDate.value || filterEndDate.value) {
    const dateRange = `${filterStartDate.value || 'Start'} - ${filterEndDate.value || 'End'}`
    filters.push({ type: 'date', label: `Date: ${dateRange}`, value: `${filterStartDate.value},${filterEndDate.value}` })
  }
  if (filterCompany.value) {
    filters.push({ type: 'company', label: `Company: ${filterCompany.value}`, value: filterCompany.value })
  }
  return filters
})

// Methods
const setActiveTab = (tab: string) => {
  activeTab.value = tab
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'tools' ? 'context' : 'tools'
}

const removeFilter = (filterType: string) => {
  switch (filterType) {
    case 'keyword':
      filterKeyword.value = ''
      break
    case 'date':
      filterStartDate.value = ''
      filterEndDate.value = ''
      break
    case 'company':
      filterCompany.value = ''
      break
  }
}

const clearAllFilters = () => {
  filterKeyword.value = ''
  filterStartDate.value = ''
  filterEndDate.value = ''
  filterCompany.value = ''
}

// Define emits
const emit = defineEmits(['filtersApplied', 'filtersChanged'])

const applyFilters = () => {
  console.log('Applying filters:', {
    keyword: filterKeyword.value,
    dateRange: { start: filterStartDate.value, end: filterEndDate.value },
    company: filterCompany.value
  })
  
  // Automatically switch to files tab to show filter results
  activeTab.value = 'files'
  
  // Emit filtered results to parent component
  emit('filtersApplied', {
    filteredFiles: filteredFiles.value,
    appliedFilters: appliedFilters.value,
    filterCount: appliedFilters.value.length
  })
  
  console.log('Emitted filtered files to parent:', filteredFiles.value)
}

// Expose filtered files and filter functions to parent component
defineExpose({
  filteredFiles,
  appliedFilters,
  filterKeyword,
  filterStartDate,
  filterEndDate,
  filterCompany,
  clearAllFilters,
  applyFilters
})
</script>

<template>
  <!-- Additional Sidebar (Tools/Context) -->
  <aside class="w-80 base-card bg-card flex flex-col h-full overflow-hidden">
    <!-- Header with Toggle -->
    <div class="border-b py-4 pb-0 chat-tool-border flex-shrink-0">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold chat-tool-header-title">
          {{ viewMode === 'tools' ? 'Chat Tools' : 'Context View' }}
        </h3>
        <div class="flex items-center gap-2">
          <!-- Toggle Button -->
          <button
            @click="toggleViewMode"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors chat-tool-toggle"
            :class="viewMode === 'context' ? 'active' : ''"
          >
            <BrainIcon class="w-3.5 h-3.5" />
            <span>{{ viewMode === 'tools' ? 'Context' : 'Tools' }}</span>
          </button>
        </div>
      </div>
      
      <!-- Tab Navigation (Only for Tools Mode) -->
      <div v-if="viewMode === 'tools'" class="flex gap-1 text-sm">
        <button 
          @click="setActiveTab('files')"
          class="px-3 py-2 rounded-t-lg transition-colors chat-tool-tab"
          :class="activeTab === 'files' ? 'active border-b-2' : ''"
        >
          <FilesIcon class="w-4 h-4 inline mr-1" />
          Files
        </button>
        <button 
          @click="setActiveTab('filter')"
          class="px-3 py-2 rounded-t-lg transition-colors chat-tool-tab"
          :class="activeTab === 'filter' ? 'active border-b-2' : ''"
        >
          <FilterIcon class="w-4 h-4 inline mr-1" />
          Filter
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto">
      <!-- Tools Mode -->
      <div v-if="viewMode === 'tools'" class="pt-4">
        <!-- Files Tab -->
        <div v-if="activeTab === 'files'" class="space-y-3">
          <div 
            v-for="file in filteredFiles" 
            :key="file.knowledge_source_id"
            class="p-3 border rounded-lg transition-colors chat-tool-file"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-sm truncate chat-tool-file-title">{{ file.file_name }}</h4>
                <div class="flex items-center gap-2 mt-1 text-xs chat-tool-file-meta">
                  <CalendarIcon class="w-3 h-3" />
                  <span>{{ file.date }}</span>
                  <span>•</span>
                  <BuildingIcon class="w-3 h-3" />
                  <span>{{ file.company }}</span>
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

        <!-- Filter Tab -->
        <div v-if="activeTab === 'filter'" class="space-y-4">
          <!-- Keyword Filter -->
          <div>
            <label class="block text-sm font-medium mb-2 chat-tool-form-label">
              <SearchIcon class="w-4 h-4 inline mr-1" />
              Search Keyword
            </label>
            <input
              v-model="filterKeyword"
              type="text"
              placeholder="Enter keyword to search..."
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

          <!-- Company Filter -->
          <div>
            <label class="block text-sm font-medium mb-2 chat-tool-form-label">
              <BuildingIcon class="w-4 h-4 inline mr-1" />
              Company Mentioned
            </label>
            <select
              v-model="filterCompany"
              class="w-full px-3 py-2 border rounded-lg text-sm chat-tool-form-input"
            >
              <option value="">All companies</option>
              <option v-for="company in availableCompanies" :key="company" :value="company">
                {{ company }}
              </option>
            </select>
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

      <!-- Context Mode -->
      <ContextView v-else />
    </div>

    <!-- Applied Filters Footer (Only for Tools Mode) -->
    <div v-if="viewMode === 'tools' && appliedFilters.length > 0" class="border-t chat-tool-border flex-shrink-0">
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
          :key="filter.type"
          class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full chat-tool-filter-badge"
        >
          {{ filter.label }}
          <button 
            @click="removeFilter(filter.type)"
            class="rounded-full p-0.5"
          >
            <XIcon class="w-3 h-3" />
          </button>
        </span>
      </div>
    </div>
  </aside>
</template>