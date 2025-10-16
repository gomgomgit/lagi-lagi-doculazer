<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold admin-title">LLM Management</h1>
        <p class="admin-subtitle">Configure and manage Large Language Models</p>
      </div>
      <!-- <BaseButton>
        <PlusIcon class="w-4 h-4" />
        Add Model
      </BaseButton> -->
    </div>

    <!-- LLM Models List -->
    <div class="admin-page-card rounded-lg overflow-hidden">
      <div class="px-6 py-4 admin-header">
        <h3 class="text-lg font-medium admin-title">Available Models</h3>
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
                  <!-- <span class="text-xs admin-table-meta">{{ model.usage }} requests today</span> -->
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <!-- Status Toggle -->
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  :checked="model.status === 'active'"
                  @change="toggleModelStatus(model)"
                  class="sr-only peer"
                >
                <div class="admin-toggle w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              
              <!-- Actions -->
              <!-- <button class="p-2 text-gray-400 hover:text-gray-600">
                <SettingsIcon class="w-4 h-4" />
              </button>
              <button class="p-2 text-gray-400 hover:text-red-600">
                <TrashIcon class="w-4 h-4" />
              </button> -->
            </div>
          </div>
          
          <!-- Model Details -->
          <!-- <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p class="text-gray-500">Max Tokens</p>
              <p class="font-medium">{{ model.maxTokens }}</p>
            </div>
            <div>
              <p class="text-gray-500">Temperature</p>
              <p class="font-medium">{{ model.temperature }}</p>
            </div>
            <div>
              <p class="text-gray-500">Cost per 1K tokens</p>
              <p class="font-medium">${{ model.costPer1K }}</p>
            </div>
            <div>
              <p class="text-gray-500">Response Time</p>
              <p class="font-medium">{{ model.avgResponseTime }}s</p>
            </div>
          </div> -->
        </div>
      </div>
    </div>

    <!-- Configuration Section -->
    <!-- <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Global Configuration</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Default Model</label>
          <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>GPT-4 Turbo</option>
            <option>Claude 3.5 Sonnet</option>
            <option>Gemini Pro</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Rate Limit (requests/minute)</label>
          <input 
            type="number" 
            value="60"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Max Context Length</label>
          <input 
            type="number" 
            value="128000"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fallback Model</label>
          <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>Claude 3.5 Sonnet</option>
            <option>GPT-4 Turbo</option>
            <option>Gemini Pro</option>
          </select>
        </div>
      </div>
      
      <div class="mt-6 flex justify-end">
        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Save Configuration
        </button>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import { BrainIcon, CheckCircleIcon, ClockIcon, PlusIcon, SettingsIcon, TrashIcon } from 'lucide-vue-next'
import { ref } from 'vue'

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

// Methods
const toggleModelStatus = (model) => {
  model.status = model.status === 'active' ? 'inactive' : 'active'
  console.log(`Model ${model.name} status changed to ${model.status}`)
}
</script>