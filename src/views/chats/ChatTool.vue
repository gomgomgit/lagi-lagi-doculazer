<script setup lang="ts">
import ContextView from '../../components/context/ContextView.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { CircleXIcon, EyeIcon, SlidersHorizontalIcon, SquareXIcon, SearchIcon, CalendarIcon, BuildingIcon, FilterIcon, XIcon, FilesIcon, BrainIcon } from 'lucide-vue-next';
import { ref, computed } from 'vue';

// View mode state
const viewMode = ref('tools'); // 'tools' | 'context'

// Active tab state (for tools mode)
const activeTab = ref('files'); // 'files' | 'filter'

// Filter state
const filterKeyword = ref('')
const filterStartDate = ref('')
const filterEndDate = ref('')
const filterCompany = ref('')

// Sample files data
const files = ref([
  {
    id: 1,
    name: 'MoM-Notes-10/12/2024.pdf',
    date: '2024-10-12',
    company: 'PT ABC',
    type: 'pdf'
  },
  {
    id: 2,
    name: 'Financial-Report-Q3.pdf',
    date: '2024-10-10',
    company: 'PT XYZ',
    type: 'pdf'
  },
  {
    id: 3,
    name: 'Contract-Agreement.docx',
    date: '2024-10-08',
    company: 'CV DEF',
    type: 'docx'
  }
])

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

const applyFilters = () => {
  console.log('Applying filters:', {
    keyword: filterKeyword.value,
    dateRange: { start: filterStartDate.value, end: filterEndDate.value },
    company: filterCompany.value
  })
  // Here you would typically emit the filters to parent or make API call
}
</script>

<template>
  <!-- Additional Sidebar (Tools/Context) -->
  <aside class="w-80 base-card bg-card flex flex-col h-full">
    <!-- Header with Toggle -->
    <div class="border-b border-gray-200 py-4 pb-0">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-gray-800">
          {{ viewMode === 'tools' ? 'Chat Tools' : 'Context View' }}
        </h3>
        <div class="flex items-center gap-2">
          <!-- Toggle Button -->
          <button
            @click="toggleViewMode"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
            :class="viewMode === 'context' 
              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
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
          class="px-3 py-2 rounded-t-lg transition-colors"
          :class="activeTab === 'files' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'"
        >
          <FilesIcon class="w-4 h-4 inline mr-1" />
          Files
        </button>
        <button 
          @click="setActiveTab('filter')"
          class="px-3 py-2 rounded-t-lg transition-colors"
          :class="activeTab === 'filter' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'"
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
            v-for="file in files" 
            :key="file.id"
            class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-gray-800 text-sm truncate">{{ file.name }}</h4>
                <div class="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <CalendarIcon class="w-3 h-3" />
                  <span>{{ file.date }}</span>
                  <span>•</span>
                  <BuildingIcon class="w-3 h-3" />
                  <span>{{ file.company }}</span>
                </div>
              </div>
              <button class="p-1 hover:bg-gray-100 rounded">
                <EyeIcon class="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          
          <!-- Empty state for files -->
          <div v-if="files.length === 0" class="text-center py-8 text-gray-500">
            <p class="text-sm">No files uploaded yet</p>
          </div>
        </div>

        <!-- Filter Tab -->
        <div v-if="activeTab === 'filter'" class="space-y-4">
          <!-- Keyword Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <SearchIcon class="w-4 h-4 inline mr-1" />
              Search Keyword
            </label>
            <input
              v-model="filterKeyword"
              type="text"
              placeholder="Enter keyword to search..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <!-- Date Range Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon class="w-4 h-4 inline mr-1" />
              Date Range
            </label>
            <div class="space-y-2">
              <div>
                <span class="text-xs text-gray-500 mt-1 block">From</span>
                <input
                  v-model="filterStartDate"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <span class="text-xs text-gray-500 mt-1 block">To</span>
                <input
                  v-model="filterEndDate"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Company Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <BuildingIcon class="w-4 h-4 inline mr-1" />
              Company Mentioned
            </label>
            <select
              v-model="filterCompany"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All companies</option>
              <option value="PT ABC">PT ABC</option>
              <option value="PT XYZ">PT XYZ</option>
              <option value="CV DEF">CV DEF</option>
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
    <div v-if="viewMode === 'tools' && appliedFilters.length > 0" class="border-t border-gray-200 p-4">
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-medium text-gray-800 text-sm">Applied Filters</h4>
        <button 
          @click="clearAllFilters"
          class="text-xs text-gray-500 hover:text-gray-700"
        >
          Clear All
        </button>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <span 
          v-for="filter in appliedFilters" 
          :key="filter.type"
          class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
        >
          {{ filter.label }}
          <button 
            @click="removeFilter(filter.type)"
            class="hover:bg-blue-200 rounded-full p-0.5"
          >
            <XIcon class="w-3 h-3" />
          </button>
        </span>
      </div>
    </div>
  </aside>
</template>