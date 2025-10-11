<template>
  <div class="flex h-screen bg-base gap-4">
    <!-- Sidebar -->
    <aside class="w-64 base-card bg-card text-base flex flex-col">
      <!-- Sidebar Header -->
      <div class="p-4 pt-0 border-b border-gray-200">
        <h1 class="text-xl font-bold text-gray-800">My Workspace</h1>
      </div>
      
      <!-- Navigation Menu -->
      <nav class="flex-1 space-y-2">
        <div class="space-y-1">
          <router-link 
            to="/" 
            class="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            active-class="bg-blue-50 text-blue-700"
          >
            <span>Chat With AI</span>
          </router-link>
          
          <div class="text-xs text-gray-500 px-3 py-2">Documents</div>
          <div class="text-xs text-gray-500 px-3 py-2">Shared With Me</div>
          <div class="text-xs text-gray-500 px-3 py-2">Templates</div>
          <div class="text-xs text-gray-500 px-3 py-2">History</div>
        </div>
      </nav>
      
      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-gray-200">
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col gap-4">
      <!-- Header -->
      <header class="px-4 pb-0 pt-3">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">{{ currentHeader }}</h2>
            <p class="text-sm text-gray-600">{{ currentSubtitle }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="px-4 py-2 bg-gray-900 text-white text-sm rounded-full hover:bg-gray-800 transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      </header>
      <!-- Router View Content -->
      <div class="base-card bg-card grow">
        <div class="flex h-full">
          <router-view />
        </div>
      </div>
    </div>

    <router-view name="toolbar" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Computed properties untuk mendapatkan header dan subtitle dari route meta
const currentHeader = computed(() => {
  return route.meta?.header || 'Default Header'
})

const currentSubtitle = computed(() => {
  return route.meta?.subtitle || 'Default subtitle for this page.'
})
</script>