<template>
  <div class="flex h-screen bg-base gap-4 p-4">
    <!-- Admin Sidebar -->
    <aside class="w-64 base-card bg-card text-base flex flex-col">
      <!-- Sidebar Header -->
      <div class="py-4 border-b border-gray-200">
        <div class="flex items-center gap-2">
          <div>
            <h1 class="text-lg font-bold text-gray-800">Admin Panel</h1>
            <p class="text-xs text-gray-500">System Management</p>
          </div>
        </div>
      </div>
      
      <!-- Navigation Menu -->
      <nav class="flex-1 space-y-1 mt-4">
        <router-link 
          to="/admin/users"
          class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          :class="{ 'bg-blue-50 text-blue-700': $route.path === '/admin/users' }"
        >
          <UsersIcon class="w-5 h-5" />
          <span class="font-medium">Users</span>
        </router-link>
        
        <router-link 
          to="/admin/llm"
          class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          :class="{ 'bg-blue-50 text-blue-700': $route.path === '/admin/llm' }"
        >
          <BrainIcon class="w-5 h-5" />
          <span class="font-medium">LLM</span>
        </router-link>
      </nav>
      
      <!-- Sidebar Footer -->
      <div class="border-t border-gray-200 pt-4">
        <router-link 
          to="/"
          class="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors base-button btn-action"
        >
          <ArrowLeftIcon class="w-4 h-4" />
          <span>Back to Main</span>
        </router-link>
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
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              Admin User
              <button class="px-2 py-2 bg-gray-900 text-white text-sm rounded-full">
                <ShieldIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <!-- Router View Content -->
      <div class="flex-1 bg-white rounded-lg base-card p-6 overflow-auto">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowLeftIcon, BrainIcon, SettingsIcon, ShieldIcon, UsersIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Computed properties untuk mendapatkan header dan subtitle dari route meta
const currentHeader = computed(() => {
  return route.meta?.header || 'Admin Dashboard'
})

const currentSubtitle = computed(() => {
  return route.meta?.subtitle || 'Manage system settings and configurations'
})
</script>