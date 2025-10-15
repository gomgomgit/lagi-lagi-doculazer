<template>
  <CardHeader 
    title="Project List" 
    subtitle="Select a project to manage documents" 
  >
    <template #action>
      <BaseButton 
        variant="primary" 
        size="sm" 
        class="flex items-center gap-2" 
        @click="showAddProjectModal"
      >
        <FolderPlusIcon class="w-4 h-4" /> Add New Project
      </BaseButton>
    </template>    
  </CardHeader>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
    <div 
      v-for="project in projects" 
      :key="project.id"
      @click="selectProject(project)"
      class="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-orange hover:shadow-md transition-all duration-200"
    >
      <div class="flex items-start justify-between mb-4">
        <div class="p-3 bg-orange/10 rounded-lg">
          <FolderClosedIcon class="w-8 h-8 text-orange" />
        </div>
        <span class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {{ getDocumentCount(project.id) }} docs
        </span>
      </div>
      
      <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ project.name }}</h3>
      
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>Created: {{ formatDate(project.createdDate) }}</span>
        <span>Updated: {{ formatDate(project.lastUpdated) }}</span>
      </div>
    </div>
  </div>
  
  <!-- Empty state untuk projects -->
  <div v-if="projects.length === 0" class="text-center py-12">
    <FolderPlusIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 class="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
    <p class="text-gray-500 mb-6">Create your first project to start managing documents</p>
    <BaseButton variant="primary" @click="showAddProjectModal">
      <FolderPlusIcon class="w-4 h-4" /> Create Project
    </BaseButton>
  </div>
  
  <!-- Add Project Modal -->
  <AddProjectModal
    :show="showModal"
    @confirm="handleAddProject"
    @cancel="cancelAddProject"
  />
</template>

<script setup>
import { ref } from 'vue'
import { FolderClosedIcon, FolderPlusIcon } from 'lucide-vue-next'
import CardHeader from '@/components/ui/CardHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import AddProjectModal from './AddProjectModal.vue'

// Props
const props = defineProps({
  projects: {
    type: Array,
    required: true
  },
  getDocumentCount: {
    type: Function,
    required: true
  }
})

// Emits
const emit = defineEmits(['project-selected', 'add-project'])

// State
const showModal = ref(false)

// Methods
const selectProject = (project) => {
  emit('project-selected', project)
}

const showAddProjectModal = () => {
  showModal.value = true
}

const cancelAddProject = () => {
  showModal.value = false
}

const handleAddProject = (newProject) => {
  emit('add-project', newProject)
  showModal.value = false
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>