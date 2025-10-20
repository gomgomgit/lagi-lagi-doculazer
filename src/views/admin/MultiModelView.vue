<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold admin-title">Multi Model Management</h1>
        <p class="admin-subtitle">Configure and manage Language Models and Embeddings</p>
      </div>
      <!-- <BaseButton>
        <PlusIcon class="w-4 h-4" />
        Add Model
      </BaseButton> -->
    </div>

    <!-- Tab Navigation -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'llm'"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === 'llm'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <BrainIcon class="w-4 h-4 inline mr-2" />
          Language Models
        </button>
        <button
          @click="activeTab = 'embedding'"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === 'embedding'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          <NetworkIcon class="w-4 h-4 inline mr-2" />
          Embedding Models
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="mt-6">
      <!-- LLM Models Tab -->
      <div v-if="activeTab === 'llm'" class="space-y-6">
        <div class="admin-page-card rounded-lg overflow-hidden">
          <div class="px-6 py-4 admin-header">
            <h3 class="text-lg font-medium admin-title">Available Language Models</h3>
          </div>
          
          <div class="divide-y divide-gray-200">
            <div v-for="model in llmModels" :key="model.id" class="p-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="h-12 w-12 rounded-lg btn-action flex items-center justify-center">
                    <BrainIcon class="w-6 h-6" />
                  </div>
                  <div>
                    <h4 class="text-lg font-medium admin-table-text">{{ model.name }}</h4>
                    <p class="text-sm admin-table-meta">{{ model.provider }} • {{ model.version }}</p>
                    <div class="flex items-center gap-4 mt-2">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                            :class="model.status === 'active' ? 'admin-status-active' : 'admin-status-inactive'">
                        {{ model.status }}
                      </span>
                      <span class="text-xs admin-table-meta">{{ model.usage || 0 }} requests today</span>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <!-- Status Toggle -->
                  <label class="admin-toggle w-11 h-6 cursor-pointer">
                    <input 
                      type="checkbox" 
                      :checked="model.status === 'active'"
                      @change="toggleModelStatus(model)"
                    >
                    <span class="admin-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Embedding Models Tab -->
      <div v-if="activeTab === 'embedding'" class="space-y-6">
        <div class="admin-page-card rounded-lg overflow-hidden">
          <div class="px-6 py-4 admin-header">
            <h3 class="text-lg font-medium admin-title">Available Embedding Models</h3>
          </div>
          
          <div class="divide-y divide-gray-200">
            <div v-for="model in embeddingModels" :key="model.id" class="p-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="h-12 w-12 rounded-lg btn-action flex items-center justify-center">
                    <NetworkIcon class="w-6 h-6" />
                  </div>
                  <div>
                    <h4 class="text-lg font-medium admin-table-text">{{ model.name }}</h4>
                    <p class="text-sm admin-table-meta">{{ model.provider }} • Dimensions: {{ model.dimensions }}</p>
                    <div class="flex items-center gap-4 mt-2">
                      <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                            :class="model.status === 'active' ? 'admin-status-active' : 'admin-status-inactive'">
                        {{ model.status }}
                      </span>
                      <span class="text-xs admin-table-meta">{{ model.usage || 0 }} embeddings today</span>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-2">
                  <!-- Status Toggle -->
                  <label class="admin-toggle w-11 h-6 cursor-pointer">
                    <input 
                      type="checkbox" 
                      :checked="model.status === 'active'"
                      @change="toggleEmbeddingStatus(model)"
                    >
                    <span class="admin-toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import { BrainIcon, CheckCircleIcon, ClockIcon, PlusIcon, SettingsIcon, TrashIcon, NetworkIcon } from 'lucide-vue-next'
import { ref } from 'vue'

// Active tab
const activeTab = ref('llm')

// Sample LLM models data
const llmModels = ref([
  {
    id: 1,
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    version: 'gpt-4-1106-preview',
    status: 'active',
    usage: 1247,
    maxTokens: '128k',
    temperature: 0.7,
    costPer1K: 0.01,
    avgResponseTime: 2.1
  },
  {
    id: 2,
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    version: 'claude-3-5-sonnet-20240620',
    status: 'active',
    usage: 892,
    maxTokens: '200k',
    temperature: 0.7,
    costPer1K: 0.015,
    avgResponseTime: 1.8
  },
  {
    id: 3,
    name: 'Gemini Pro',
    provider: 'Google',
    version: 'gemini-pro-1.5',
    status: 'inactive',
    usage: 0,
    maxTokens: '1M',
    temperature: 0.9,
    costPer1K: 0.007,
    avgResponseTime: 3.2
  }
])

// Sample Embedding models data
const embeddingModels = ref([
  {
    id: 1,
    name: 'text-embedding-3-large',
    provider: 'OpenAI',
    dimensions: 3072,
    status: 'active',
    usage: 5432,
    costPer1K: 0.00013,
    avgResponseTime: 0.5
  },
  {
    id: 2,
    name: 'text-embedding-3-small',
    provider: 'OpenAI',
    dimensions: 1536,
    status: 'active',
    usage: 3210,
    costPer1K: 0.00002,
    avgResponseTime: 0.3
  },
  {
    id: 3,
    name: 'embedding-001',
    provider: 'Google',
    dimensions: 768,
    status: 'inactive',
    usage: 0,
    costPer1K: 0.00001,
    avgResponseTime: 0.8
  },
  {
    id: 4,
    name: 'voyage-large-2',
    provider: 'Voyage AI',
    dimensions: 1536,
    status: 'active',
    usage: 1876,
    costPer1K: 0.00012,
    avgResponseTime: 0.6
  }
])

// Methods
const toggleModelStatus = (model) => {
  model.status = model.status === 'active' ? 'inactive' : 'active'
  console.log(`LLM Model ${model.name} status changed to ${model.status}`)
}

const toggleEmbeddingStatus = (model) => {
  model.status = model.status === 'active' ? 'inactive' : 'active'
  console.log(`Embedding Model ${model.name} status changed to ${model.status}`)
}
</script>