<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold admin-title">User Management</h1>
        <p class="admin-subtitle">Manage system users and their permissions</p>
      </div>
      <BaseButton @click="showAddUserModal">
        <PlusIcon class="w-4 h-4" />
        Add User
      </BaseButton>
    </div>

    <!-- Search and Filter Bar -->
    <div class="flex gap-4 items-center">
      <div class="flex-1 relative">
        <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search users by name or email..."
          class="admin-form-input w-full pl-10 pr-4 py-2 rounded-lg"
        />
      </div>
      <select 
        v-model="filterRole"
        class="admin-form-input px-3 py-2 rounded-lg"
      >
        <option value="">All Roles</option>
        <option value="ADMIN">Admin</option>
        <option value="USER">User</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="admin-page-card rounded-lg p-8 text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-500">Loading users...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="admin-page-card rounded-lg p-8 text-center">
      <div class="text-red-600 mb-4">
        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <p class="text-red-600 font-medium">{{ error }}</p>
      <BaseButton @click="fetchUsers" variant="secondary" class="mt-4">
        Try Again
      </BaseButton>
    </div>

    <!-- Users Table -->
    <div v-else class="admin-page-card rounded-lg overflow-hidden">
      <table class="w-full">
        <thead class="admin-table-header">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium admin-table-header-text uppercase tracking-wider">User</th>
            <th class="px-6 py-3 text-left text-xs font-medium admin-table-header-text uppercase tracking-wider">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium admin-table-header-text uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <!-- Empty State -->
          <tr v-if="filteredUsers.length === 0">
            <td colspan="3" class="px-6 py-8 text-center">
              <UserIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p class="text-gray-500 font-medium">No users found</p>
              <p class="text-gray-400 text-sm">{{ searchQuery || filterRole ? 'Try adjusting your filters' : 'Get started by adding your first user' }}</p>
            </td>
          </tr>
          
          <!-- User Rows -->
          <tr v-else v-for="user in filteredUsers" :key="user.id" class="admin-table-row">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <UserIcon class="w-5 h-5 text-gray-600" />
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium admin-table-text">{{ user.name }}</div>
                  <div class="text-sm admin-table-meta">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getRoleColor(user.role)">
                {{ user.role }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex">
              <BaseButton 
                @click="editUser(user)"
                variant="icon"
                size="sm"
                :icon="EditIcon"
                class="text-blue-600 hover:text-blue-900"
                title="Edit User"
              />
              <BaseButton 
                @click="deleteUser(user)"
                variant="icon"
                size="sm"
                :icon="TrashIcon"
                class="text-red-600 hover:text-red-900"
                title="Delete User"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-500">
        Showing {{ filteredUsers.length }} of {{ users.length }} users
      </div>
      <div class="flex gap-2">
        <BaseButton 
          variant="secondary" 
          size="sm"
        >
          Previous
        </BaseButton>
        <BaseButton 
          variant="secondary" 
          size="sm"
        >
          Next
        </BaseButton>
      </div>
    </div>

    <!-- User Form Modal -->
    <UserFormModal
      :show="showModal"
      :user="selectedUser"
      @confirm="handleUserSubmit"
      @cancel="cancelUserForm"
    />
  </div>
</template>

<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import UserFormModal from '@/components/admin/UserFormModal.vue'
import { EditIcon, PlusIcon, SearchIcon, TrashIcon, UserIcon } from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'
import { useUsers } from '@/composables/useUsers'

// Use users composable
const { users, loading, error, fetchUsers, addUser, updateUserData, deleteUserById } = useUsers()

// State
const searchQuery = ref('')
const filterRole = ref('')
const showModal = ref(false)
const selectedUser = ref(null)

// Computed properties
const filteredUsers = computed(() => {
  let result = users.value

  if (searchQuery.value) {
    result = result.filter(user =>
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (filterRole.value) {
    result = result.filter(user => user.role === filterRole.value)
  }

  return result
})

// Methods
const getRoleColor = (role) => {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-100 text-red-800'
    case 'USER':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Modal methods
const showAddUserModal = () => {
  selectedUser.value = null
  showModal.value = true
}

const editUser = (user) => {
  console.log('Editing user:', user)
  selectedUser.value = { ...user }
  showModal.value = true
}

const deleteUser = async (user) => {
  if (confirm(`Are you sure you want to delete ${user.name}?`)) {
    const success = await deleteUserById(user.user_id)
    if (success) {
      console.log('User deleted successfully:', user.name)
      fetchUsers()
    } else {
      console.error('Failed to delete user:', user.name)
    }
  }
}

const handleUserSubmit = async (userData) => {
  try {
    if (selectedUser.value) {
      // Edit existing user
      const result = await updateUserData(selectedUser.value.user_id, userData)
      if (result) {
        console.log('User updated successfully:', userData.name)
        showModal.value = false
        selectedUser.value = null
      } else {
        console.error('Failed to update user')
      }
    } else {
      // Add new user
      console.log('Adding new user:', userData)
      const result = await addUser(userData)
      if (result) {
        console.log('User added successfully:', userData.name)
        showModal.value = false
        selectedUser.value = null
      } else {
        console.error('Failed to add user')
      }
    }
  } catch (err) {
    console.error('Error in handleUserSubmit:', err)
  } finally {
    fetchUsers()
  }
}

const cancelUserForm = () => {
  showModal.value = false
  selectedUser.value = null
}

// Lifecycle
onMounted(() => {
  fetchUsers()
})
</script>