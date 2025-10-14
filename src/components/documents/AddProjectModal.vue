<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="cancel"
  >
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="p-2 bg-orange/10 rounded-full">
          <FolderPlusIcon class="w-6 h-6 text-orange" />
        </div>
        <div>
          <h3 class="text-lg font-medium text-gray-900">Create New Project</h3>
          <p class="text-sm text-gray-500">Enter a name for your new project</p>
        </div>
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="mb-6">
          <label for="projectName" class="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            id="projectName"
            ref="projectNameInput"
            v-model="projectName"
            type="text"
            placeholder="Enter project name..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-orange text-sm"
            :class="{
              'border-red-300 focus:border-red-300 focus:ring-red-200': error
            }"
            :disabled="loading"
          />
          <p v-if="error" class="text-red-600 text-sm mt-1">{{ error }}</p>
        </div>
        
        <div class="flex justify-end gap-3">
          <BaseButton 
            type="button"
            variant="secondary" 
            size="sm"
            @click="cancel"
            :disabled="loading"
          >
            Cancel
          </BaseButton>
          <BaseButton 
            type="submit"
            variant="primary" 
            size="sm"
            :disabled="!projectName.trim() || loading"
          >
            <FolderPlusIcon class="w-4 h-4" /> 
            {{ loading ? 'Creating...' : 'Create Project' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { FolderPlusIcon } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['confirm', 'cancel'])

// State
const projectName = ref('')
const loading = ref(false)
const error = ref('')
const projectNameInput = ref(null)

// Watch for modal show/hide to focus input and reset form
watch(() => props.show, async (newShow) => {
  if (newShow) {
    // Reset form when modal opens
    projectName.value = ''
    error.value = ''
    loading.value = false
    
    // Focus input after modal is rendered
    await nextTick()
    projectNameInput.value?.focus()
  }
})

// Methods
const cancel = () => {
  if (!loading.value) {
    emit('cancel')
  }
}

const validateProjectName = (name) => {
  if (!name.trim()) {
    return 'Project name is required'
  }
  
  if (name.trim().length < 3) {
    return 'Project name must be at least 3 characters'
  }
  
  if (name.trim().length > 50) {
    return 'Project name must be less than 50 characters'
  }
  
  // Check for valid characters (letters, numbers, spaces, hyphens, underscores)
  const validNameRegex = /^[a-zA-Z0-9\s\-_]+$/
  if (!validNameRegex.test(name.trim())) {
    return 'Project name can only contain letters, numbers, spaces, hyphens, and underscores'
  }
  
  return null
}

const handleSubmit = async () => {
  const trimmedName = projectName.value.trim()
  
  // Validate project name
  const validationError = validateProjectName(trimmedName)
  if (validationError) {
    error.value = validationError
    return
  }
  
  // Clear any previous errors
  error.value = ''
  loading.value = true
  
  try {
    // Create new project object
    const newProject = {
      name: trimmedName,
      description: `Project for ${trimmedName}`, // Default description
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    }
    
    // Emit the project to parent
    await emit('confirm', newProject)
    
    // Reset form on success
    projectName.value = ''
    loading.value = false
  } catch (err) {
    error.value = err.message || 'Failed to create project'
    loading.value = false
  }
}
</script>