<template>
  <div class="space-y-1">
    <!-- Project Header -->
    <div  
      class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer project-accordion-header"
      :class="{ 'expanded': isExpanded }"
      @click="toggleExpanded"
    >
      <FolderIcon class="w-4 h-4" />
      <span class="flex-1 truncate">{{ project.name }}</span>
      <ChevronRightIcon 
        class="w-4 h-4 transition-transform duration-200" 
        :class="{ 'rotate-90': isExpanded }"
      />
    </div>
    
    <!-- Conversations List -->
    <transition 
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-96"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 max-h-96" 
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-show="isExpanded" class="ml-3 space-y-1 overflow-hidden">
        <div 
          v-for="conversation in project.conversations" 
          :key="conversation.id"
          class="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer project-accordion-conversation"
          :class="{ 'selected': selectedConversationId === conversation.id }"
          @click.stop="selectConversation(conversation)"
        >
          <MessageCircleIcon class="w-3 h-3 flex-shrink-0" />
          <span class="truncate">{{ conversation.title }}</span>
          <span v-if="conversation.messageCount" class="text-xs px-1.5 py-0.5 rounded-full project-accordion-message-count">
            {{ conversation.messageCount }}
          </span>
        </div>
        
        <!-- Add new conversation button -->
        <div 
          class="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer project-accordion-new-chat"
          @click.stop="addNewConversation"
        >
          <PlusIcon class="w-3 h-3" />
          <span>New Chat</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ChevronRightIcon, FolderIcon, MessageCircleIcon, PlusIcon } from 'lucide-vue-next'

// Props
const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  selectedConversationId: {
    type: [Number, String, null],
    default: null
  },
  expandedByDefault: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'conversation-selected',
  'add-conversation'
])

// State
const isExpanded = ref(props.expandedByDefault)

// Methods
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const selectConversation = (conversation) => {
  emit('conversation-selected', conversation)
}

const addNewConversation = () => {
  emit('add-conversation', props.project)
}
</script>

<style scoped>
.max-h-96 {
  max-height: 24rem;
}
.max-h-0 {
  max-height: 0;
}
</style>