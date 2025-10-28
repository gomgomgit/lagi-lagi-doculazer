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
          <h3 class="text-lg font-medium modal-title">Rename Chat</h3>
          <p class="text-sm modal-subtitle">Update conversation name</p>
        </div>
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="mb-6">
          <label for="conversationName" class="block text-sm font-medium mb-2 form-label">
            Conversation Name
          </label>
          <input
            id="conversationName"
            ref="conversationNameInput"
            v-model="conversationName"
            type="text"
            placeholder="Enter conversation name..."
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
            :disabled="!conversationName.trim() || loading || conversationName === conversation?.conversation_name"
          >
            <EditIcon class="w-4 h-4" /> 
            {{ loading ? 'Updating...' : 'Update Chat' }}
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
  conversation: {
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
const conversationName = ref('')
const localError = ref('')
const conversationNameInput = ref(null)

// Computed for combined error (local validation + API error)
const displayError = computed(() => localError.value || props.error)

// Watch for modal show/hide to focus input and reset form
watch(() => props.show, async (newShow) => {
  if (newShow && props.conversation) {
    // Set current conversation name when modal opens
    conversationName.value = props.conversation.conversation_name || ''
    localError.value = ''
    
    // Focus input after modal is rendered
    await nextTick()
    conversationNameInput.value?.focus()
  }
})

// Methods
const cancel = () => {
  if (!props.loading) {
    emit('cancel')
  }
}

const handleSubmit = async () => {
  const trimmedName = conversationName.value.trim()
  
  // Clear any previous local errors
  localError.value = ''
  
  // Create updated conversation object
  const updatedConversation = {
    conversation_name: trimmedName
  }
  
  // Emit the updated conversation to parent (parent will handle loading and API call)
  emit('confirm', props.conversation.conversation_id, updatedConversation)
  
  // Form will be reset by parent on success
}
</script>