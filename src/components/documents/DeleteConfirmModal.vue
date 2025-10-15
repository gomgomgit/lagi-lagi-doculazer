<template>
  <div 
    v-if="show" 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="cancel"
  >
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="p-2 bg-red-100 rounded-full">
          <AlertTriangleIcon class="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 class="text-lg font-medium text-gray-900">Delete Document</h3>
          <p class="text-sm text-gray-500">This action cannot be undone</p>
        </div>
      </div>
      
      <p class="text-gray-700 mb-6">
        Are you sure you want to delete "<strong>{{ document?.name }}</strong>"?
      </p>
      
      <div class="flex justify-end gap-3">
        <BaseButton 
          variant="secondary" 
          size="sm"
          @click="cancel"
        >
          Cancel
        </BaseButton>
        <BaseButton 
          variant="primary" 
          size="sm"
          @click="confirmDelete"
          class="bg-red-600 hover:bg-red-700 text-white"
          :disabled="loading"
        >
          <TrashIcon class="w-4 h-4" /> 
          {{ loading ? 'Deleting...' : 'Delete' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { AlertTriangleIcon, TrashIcon } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  document: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['confirm', 'cancel'])

// State
const loading = ref(false)

// Methods
const cancel = () => {
  if (!loading.value) {
    emit('cancel')
  }
}

const confirmDelete = async () => {
  loading.value = true
  try {
    await emit('confirm', props.document)
  } finally {
    loading.value = false
  }
}
</script>