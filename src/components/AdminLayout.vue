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
          <span class="font-medium">Multi Model</span>
        </router-link>
      </nav>
      
      <!-- Sidebar Footer -->
      <div>
        <!-- Admin users don't have access to main user area -->
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
            <!-- User Dropdown -->
            <div class="relative" ref="userDropdownRef">
              <button 
                @click="toggleUserDropdown"
                class="flex items-center gap-4 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <div class="flex items-center gap-2">
                  {{ authStore.user?.email || 'Admin' }}
                  <div class="px-2 py-2 bg-gray-900 text-white text-sm rounded-full hover:bg-gray-800 transition-colors">
                    <ShieldIcon class="w-4 h-4" />
                  </div>
                </div>
              </button>
              
              <!-- Dropdown Menu -->
              <div 
                v-if="showUserDropdown"
                class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              >
                <div class="py-1">
                  <router-link 
                    to="/admin/profile"
                    @click="closeUserDropdown"
                    class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <UserIcon class="w-4 h-4" />
                    <span>Profile</span>
                  </router-link>
                  <button 
                    @click="handleLogout"
                    class="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    <LogOutIcon class="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
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
import { ArrowLeftIcon, BrainIcon, LogOutIcon, SettingsIcon, ShieldIcon, UserIcon, UsersIcon } from 'lucide-vue-next'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// State for user dropdown
const showUserDropdown = ref(false)
const userDropdownRef = ref(null)

// Computed properties untuk mendapatkan header dan subtitle dari route meta
const currentHeader = computed(() => {
  return route.meta?.header || 'Admin Dashboard'
})

const currentSubtitle = computed(() => {
  return route.meta?.subtitle || 'Manage system settings and configurations'
})

// User Dropdown handlers
const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

const closeUserDropdown = () => {
  showUserDropdown.value = false
}

const handleLogout = async () => {
  console.log('Admin logout clicked')
  closeUserDropdown()
  
  try {
    // Call logout method from auth store
    await authStore.logout()
    
    // Redirect to login page
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    // Even if logout fails, redirect to login
    router.push('/login')
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (userDropdownRef.value && !userDropdownRef.value.contains(event.target)) {
    closeUserDropdown()
  }
}

// Setup event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>