<template>
  <div class="flex h-screen admin-layout gap-4 p-4">
    <!-- Admin Sidebar -->
    <aside class="w-64 base-card admin-sidebar text-base flex flex-col">
      <!-- Sidebar Header -->
      <div class="py-4 border-b admin-sidebar-border">
        <div class="flex items-center gap-2">
          <div>
            <h1 class="text-lg font-bold admin-sidebar-title">Admin Panel</h1>
            <p class="text-xs admin-sidebar-subtitle">System Management</p>
          </div>
        </div>
      </div>
      
      <!-- Navigation Menu -->
      <nav class="flex-1 space-y-1 mt-4">
        <router-link 
          to="/admin/users"
          class="flex items-center gap-3 px-4 py-3 text-sm admin-nav-link rounded-lg transition-colors"
          :class="{ 'active': $route.path === '/admin/users' }"
        >
          <UsersIcon class="w-5 h-5" />
          <span class="font-medium">Users</span>
        </router-link>
        
        <router-link 
          to="/admin/llm"
          class="flex items-center gap-3 px-4 py-3 text-sm admin-nav-link rounded-lg transition-colors"
          :class="{ 'active': $route.path === '/admin/llm' }"
        >
          <BrainIcon class="w-5 h-5" />
          <span class="font-medium">LLM</span>
        </router-link>
      </nav>
      
      <!-- Sidebar Footer -->
      <div>
        <router-link 
          to="/"
          class="flex items-center gap-2 text-sm admin-back-link transition-colors base-button btn-action"
        >
          <ArrowLeftIcon class="w-4 h-4" />
          <span>Back to Main</span>
        </router-link>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col gap-4">
      <!-- Header -->
      <header class="px-4 pb-0 pt-3 admin-header-bg">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold admin-header-title">{{ currentHeader }}</h2>
            <p class="text-sm admin-header-subtitle">{{ currentSubtitle }}</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 admin-header-subtitle">
              Admin User
              <button class="px-2 py-2 admin-user-button text-sm rounded-full transition-colors">
                <ShieldIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <!-- Router View Content -->
      <div class="flex-1 admin-content rounded-lg base-card p-6 overflow-auto">
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