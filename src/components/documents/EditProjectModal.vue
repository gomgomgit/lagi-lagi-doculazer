<template>
  <div 
    v-if="show" 
    class="fixed inset-0 flex items-center justify-center z-50 p-4 modal-overlay"
    @click.self="cancel"
  >
    <div class="rounded-lg max-w-md w-full p-6 modal-content">
      <div class="flex items-center gap-3 mb-4">
        <div class="p-2 rounded-full modal-header-icon-bg">
          <EditIcon class="w-6 h-6 modal-header-icon" />
        </div>
        <div>
          <h3 class="text-lg font-medium modal-title">Edit Project</h3>
          <p class="text-sm modal-subtitle">Update project information</p>
        </div>
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="mb-6">
          <label for="projectName" class="block text-sm font-medium mb-2 form-label">
            Project Name
          </label>
          <input
            id="projectName"
            ref="projectNameInput"
            v-model="projectName"
            type="text"
            placeholder="Enter project name..."
            class="w-full px-3 py-2 border rounded-lg text-sm form-input"
            :class="{
              'error': displayError
            }"
            :disabled="loading"
          />
          <p v-if="displayError" class="text-sm mt-1 form-error-text">{{ displayError }}</p>
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
            :disabled="!projectName.trim() || loading || projectName === project?.name"
          >
            <EditIcon class="w-4 h-4" /> 
            {{ loading ? 'Updating...' : 'Update Project' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { EditIcon } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  project: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['confirm', 'cancel'])

// State
const projectName = ref('')
const localError = ref('')
const projectNameInput = ref(null)

// Computed for combined error (local validation + API error)
const displayError = computed(() => localError.value || props.error)

// Watch for modal show/hide to focus input and reset form
watch(() => props.show, async (newShow) => {
  if (newShow && props.project) {
    // Set current project name when modal opens
    projectName.value = props.project.name || ''
    localError.value = ''
    
    // Focus input after modal is rendered
    await nextTick()
    projectNameInput.value?.focus()
  }
})

// Methods
const cancel = () => {
  if (!props.loading) {
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
    localError.value = validationError
    return
  }
  
  // Check if name actually changed
  if (trimmedName === props.project?.name) {
    localError.value = 'Please change the project name'
    return
  }
  
  // Clear any previous local errors
  localError.value = ''
  
  // Create updated project object
  const updatedProject = {
    project_name: trimmedName,
    system_prompt: ''
  }
  
  // Emit the updated project to parent (parent will handle loading and API call)
  emit('confirm', props.project.id, updatedProject)
  
  // Form will be reset by parent on success
}
</script>
