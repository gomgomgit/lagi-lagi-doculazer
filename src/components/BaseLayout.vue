<template>
  <div class="flex h-screen bg-base gap-4 p-4">
    <!-- Sidebar -->
    <aside class="w-80 base-card bg-card text-base flex flex-col">
      <!-- Sidebar Header -->
      <div class="py-2 pt-0 border-b border-gray-200">
        <h1 class="text-xl font-bold text-gray-800">My Workspace</h1>
      </div>
      
      <!-- Navigation Menu -->
      <nav class="flex-1 space-y-2 mt-2 overflow-y-auto overflow-x-hidden">
        <!-- Add Project Button -->
        <button 
          @click="showAddProjectModal"
          class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 rounded-lg transition-colors"
        >
          <PlusIcon class="w-4 h-4" />
          <span>Add New Project</span>
        </button>
        
        <!-- Project Accordion List -->
        
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p class="text-sm text-gray-500">Loading projects...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="text-center py-8">
          <div class="text-red-500 mb-3">
            <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01"></path>
            </svg>
          </div>
          <p class="text-sm text-red-600 mb-2">Failed to load projects</p>
          <button 
            @click="fetchProjectsWithConversations" 
            class="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
        
        <!-- Projects List -->
        <template v-else>
          <ProjectAccordion
            v-for="project in projects"
            :key="project.id"
            :project="project"
            :selected-conversation-id="selectedConversationId"
            :is-expanded="expandedProjectId === project.id"
            @conversation-selected="onConversationSelected"
            @add-conversation="onAddConversation"
            @edit-project="onEditProject"
            @delete-project="onDeleteProject"
            @edit-conversation="onEditConversation"
            @delete-conversation="onDeleteConversation"
            @toggle-expanded="onToggleProjectExpanded"
            @project-clicked="onProjectClicked"
          />
          
          <!-- Empty state -->
          <div v-if="projects.length === 0" class="text-center py-8 text-gray-500">
            <p class="text-sm">No projects available</p>
          </div>
        </template>
      </nav>
      
      <!-- Sidebar Footer -->
      <div class="">
        <router-link 
          :to="isOnChatPage ? '/documents' : '/'"
          class="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors base-button btn-action"
        >
          <FolderArchiveIcon v-if="isOnChatPage" class="w-4 h-4" />
          <MessageCircleIcon v-else class="w-4 h-4" />
          <span>{{ isOnChatPage ? 'Documents' : 'Back to Chat' }}</span>
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
            <!-- User Dropdown -->
            <div class="relative" ref="userDropdownRef">
              <button 
                @click="toggleUserDropdown"
                class="flex items-center gap-4 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <div class="flex items-center gap-2">
                  {{ authStore.user?.email || 'User' }}
                  <div class="px-2 py-2 bg-gray-900 text-white text-sm rounded-full hover:bg-gray-800 transition-colors">
                    <UserIcon class="w-4 h-4" />
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
                    to="/profile"
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
      <router-view />
    </div>

    <!-- Add Project Modal -->
    <AddProjectModal
      :show="showModal"
      :loading="loading"
      :error="error"
      @confirm="handleAddProject"
      @cancel="cancelAddProject"
    />

    <!-- Edit Project Modal -->
    <EditProjectModal
      :show="showEditModal"
      :project="projectToEdit"
      :loading="loading"
      :error="error"
      @confirm="handleEditProject"
      @cancel="cancelEditProject"
    />

    <!-- Edit Conversation Modal -->
    <EditConversationModal
      :show="showEditConversationModal"
      :conversation="conversationToEdit"
      :loading="loading"
      :error="error"
      @confirm="handleEditConversation"
      @cancel="cancelEditConversation"
    />
  </div>
</template>

<script setup>
import { ChevronDownIcon, ChevronRightIcon, CircleChevronDownIcon, FolderArchiveIcon, LogOutIcon, MessageCircleIcon, PlusIcon, SettingsIcon, UserIcon } from 'lucide-vue-next'
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ProjectAccordion from '@/components/ui/ProjectAccordion.vue'
import AddProjectModal from '@/components/documents/AddProjectModal.vue'
import EditProjectModal from '@/components/documents/EditProjectModal.vue'
import EditConversationModal from '@/components/chat/EditConversationModal.vue'
import { useProjects } from '@/composables/useProjects'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Use projects composable
const { 
  projectsWithConversations, 
  loading, 
  error, 
  fetchProjectsWithConversations,
  addProject,
  updateProjectData,
  updateConversationData,
  deleteProjectById,
  clearError
} = useProjects()

// Use projects from API instead of hardcoded data
const projects = computed(() => projectsWithConversations.value || [])

// State for navigation - simplified approach
const selectedProjectId = ref(null)
const selectedConversationId = ref(null)
const expandedProjectId = ref(null)

// Simple computed properties for selection based on current route
const currentProjectId = computed(() => {
  const projectId = route.params.projectId
  if (!projectId) return null
  const numericId = parseInt(projectId, 10)
  return isNaN(numericId) ? projectId : numericId
})

const currentConversationId = computed(() => {
  const conversationId = route.params.conversationId
  if (!conversationId || conversationId === 'new') return null
  return conversationId
})

// Update selection based on current route
const updateSelection = () => {
  console.log('Updating selection based on route:', {
    projectId: currentProjectId.value,
    conversationId: currentConversationId.value
  })
  selectedProjectId.value = currentProjectId.value
  selectedConversationId.value = currentConversationId.value
  
  // Auto-expand the current project
  if (currentProjectId.value) {
    expandedProjectId.value = currentProjectId.value
  }
  console.log('Selection updated:', {
    project: selectedProjectId.value,
    conversation: selectedConversationId.value
  })
}

// Simple watcher for route changes - handles all scenarios
watch([() => route.params.projectId, () => route.params.conversationId], 
  async ([newProjectId, newConversationId], [oldProjectId, oldConversationId]) => {
    console.log('Route changed:', { 
      from: { project: oldProjectId, conversation: oldConversationId },
      to: { project: newProjectId, conversation: newConversationId }
    })
    
    // Update selection based on new route
    updateSelection()
    
    // Handle special case: new conversation created (from 'new' to actual ID)
    if (oldConversationId === 'new' && newConversationId && newConversationId !== 'new') {
      console.log('New conversation created, refreshing sidebar...')
      await fetchProjectsWithConversations()
      // Re-update selection after data refresh
      updateSelection()
    }
  }, 
  { immediate: true }
)

// State for add project modal
const showModal = ref(false)

// State for edit project modal
const showEditModal = ref(false)
const projectToEdit = ref(null)

// State for edit conversation modal
const showEditConversationModal = ref(false)
const conversationToEdit = ref(null)

// State for user dropdown
const showUserDropdown = ref(false)
const userDropdownRef = ref(null)

// Event handlers - simplified approach
const onConversationSelected = (conversation) => {
  console.log('Conversation selected:', conversation)
  
  // Simply navigate - let the route watcher handle selection
  router.push({
    name: 'chat-conversation',
    params: {
      projectId: conversation.project_id,
      conversationId: conversation.conversation_id
    }
  })
}

const onAddConversation = (project) => {
  console.log('Add new conversation for project:', project.id)
  
  // Simply navigate - let the route watcher handle selection
  router.push({
    name: 'chat-conversation',
    params: {
      projectId: project.id,
      conversationId: 'new'
    }
  })
}

// Project accordion toggle handler
const onToggleProjectExpanded = (projectId) => {
  console.log('Toggle project expanded:', projectId)
  
  // If clicking the same project, toggle it
  if (expandedProjectId.value === projectId) {
    expandedProjectId.value = null
  } else {
    // Expand the clicked project (automatically collapses others)
    expandedProjectId.value = projectId
  }
}

// Project name click handler
const onProjectClicked = (project) => {
  router.push({
    name: 'chat-project-overview',
    params: {
      projectId: project.id
    }
  })
}

// Add Project Modal handlers
const showAddProjectModal = () => {
  clearError() // Clear any previous errors
  showModal.value = true
}

const handleAddProject = async (projectData) => {
  console.log('Add new project:', projectData)
  
  try {
    // Call API to create project
    const newProject = await addProject(projectData)
    
    if (newProject) {
      // Close modal on success
      showModal.value = false
      console.log('Project added successfully:', newProject)
      
      // Optionally refresh the projects list to ensure sync
      fetchProjectsWithConversations()
    } else {
      // Error will be handled by the composable and shown in UI
      console.error('Failed to create project')
    }
  } catch (err) {
    console.error('Error in handleAddProject:', err)
  }
}

const cancelAddProject = () => {
  showModal.value = false
}

// Edit Project handlers
const onEditProject = (project) => {
  console.log('Edit project:', project)
  projectToEdit.value = project
  clearError() // Clear any previous errors
  showEditModal.value = true
}

const handleEditProject = async (projectId, updatedData) => {
  console.log('Update project:', projectId, updatedData)
  
  try {
    // Call API to update project
    const updatedProject = await updateProjectData(projectId, updatedData)
    
    if (updatedProject) {
      // Close modal on success
      showEditModal.value = false
      projectToEdit.value = null
      console.log('Project updated successfully:', updatedProject)
      
      // Optionally refresh the projects list to ensure sync
      fetchProjectsWithConversations()
    } else {
      // Error will be handled by the composable and shown in UI
      console.error('Failed to update project')
    }
  } catch (err) {
    console.error('Error in handleEditProject:', err)
  }
}

const cancelEditProject = () => {
  showEditModal.value = false
  projectToEdit.value = null
}

// Edit Conversation handlers
const onEditConversation = (conversation) => {
  console.log('Edit conversation:', conversation)
  conversationToEdit.value = conversation
  clearError() // Clear any previous errors
  showEditConversationModal.value = true
}

const handleEditConversation = async (conversationId, updatedData) => {
  console.log('Update conversation:', conversationId, updatedData)
  
  try {
    // Find the project ID for this conversation
    let projectId = null
    for (const project of projectsWithConversations.value) {
      if (project.conversations) {
        const conversation = project.conversations.find(
          conv => conv.conversation_id === conversationId
        )
        if (conversation) {
          projectId = project.id
          break
        }
      }
    }
    
    if (!projectId) {
      console.error('Failed to find project for conversation:', conversationId)
      return
    }
    
    // Call API to update conversation
    const updatedConversation = await updateConversationData(projectId, conversationId, updatedData)
    
    if (updatedConversation) {
      // Close modal on success
      showEditConversationModal.value = false
      conversationToEdit.value = null
      console.log('Conversation updated successfully:', updatedConversation)
      
      // Fetch projects with conversations to ensure sync
      fetchProjectsWithConversations()
    } else {
      // Error will be handled by the composable and shown in UI
      console.error('Failed to update conversation')
    }
  } catch (err) {
    console.error('Error in handleEditConversation:', err)
  }
}

const cancelEditConversation = () => {
  showEditConversationModal.value = false
  conversationToEdit.value = null
}

// Delete Conversation handler
const onDeleteConversation = async (conversation) => {
  console.log('Delete conversation:', conversation)
  
  // Show confirmation dialog
  const confirmed = window.confirm(
    `Are you sure you want to delete the conversation "${conversation.conversation_name}"?\n\nThis action cannot be undone and will permanently delete all messages in this conversation.`
  )
  
  if (confirmed) {
    try {
      // TODO: Implement conversation delete API call
      // For now, we'll remove from local state
      const projects = projectsWithConversations.value
      let conversationDeleted = false
      
      for (const project of projects) {
        if (project.conversations) {
          const conversationIndex = project.conversations.findIndex(
            conv => conv.conversation_id === conversation.conversation_id
          )
          if (conversationIndex !== -1) {
            project.conversations.splice(conversationIndex, 1)
            conversationDeleted = true
            
            // If we're currently viewing this conversation, navigate away
            if (currentConversationId.value === conversation.conversation_id) {
              router.push({ name: 'chat' })
            }
            break
          }
        }
      }
      
      if (conversationDeleted) {
        console.log('Conversation deleted successfully')
      } else {
        console.error('Failed to find conversation to delete')
      }
    } catch (err) {
      console.error('Error in onDeleteConversation:', err)
    }
  }
}

// Delete Project handler
const onDeleteProject = async (project) => {
  console.log('Delete project:', project)
  
  // Show confirmation dialog
  const confirmed = window.confirm(
    `Are you sure you want to delete the project "${project.name}"?\n\nThis action cannot be undone and will permanently delete all conversations in this project.`
  )
  
  if (confirmed) {
    try {
      // Call API to delete project
      const success = await deleteProjectById(project.id)
      
      if (success) {
        console.log('Project deleted successfully:', project.id)
        
        // Refresh the projects list
        fetchProjectsWithConversations()
        
        // If the deleted project was selected, clear selection
        if (selectedProjectId.value === project.id) {
          // Selection will be updated by route watcher when we navigate
          
          // Navigate to default chat view if currently viewing deleted project
          if (route.params.projectId === project.id) {
            router.push({ name: 'chat' })
          }
        }
      } else {
        console.error('Failed to delete project')
        // Error will be handled by the composable
      }
    } catch (err) {
      console.error('Error in onDeleteProject:', err)
    }
  }
}

// User Dropdown handlers
const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

const closeUserDropdown = () => {
  showUserDropdown.value = false
}

const handleLogout = async () => {
  console.log('Logout clicked')
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

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  
  // Fetch projects with conversations when component mounts
  fetchProjectsWithConversations()
  
  // Initialize selection based on current route
  updateSelection()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Computed properties untuk mendapatkan header dan subtitle dari route meta
const currentHeader = computed(() => {
  return route.meta?.header || 'Default Header'
})

const currentSubtitle = computed(() => {
  return route.meta?.subtitle || 'Default subtitle for this page.'
})

// Computed property untuk mendeteksi apakah sedang di halaman chat
const isOnChatPage = computed(() => {
  return route.name === 'chat' || route.name === 'chat-conversation'
})
</script>