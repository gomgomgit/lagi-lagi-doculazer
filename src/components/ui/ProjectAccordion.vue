<template>
  <div class="space-y-1">
    <!-- Project Header -->
    <div  
      class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors project-accordion-header group"
      :class="{ 'expanded': isExpanded }"
    >
      <div 
        class="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
        @click="toggleExpanded"
      >
        <FolderOpenIcon v-if="isExpanded" class="w-4 h-4 flex-shrink-0" />
        <FolderIcon v-else class="w-4 h-4 flex-shrink-0" />
        <span class="flex-1 truncate min-w-0">{{ project.name }}</span>
      </div>
      
      <!-- Project Actions Dropdown -->
      <div class="relative flex-shrink-0" ref="dropdownRef">
        <button
          @click.stop="toggleDropdown"
          class="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-all opacity-0 group-hover:opacity-100"
          title="Project Options"
        >
          <MoreVerticalIcon class="w-4 h-4" />
        </button>
        
        <!-- Dropdown Menu -->
        <div 
          v-if="showDropdown"
          class="dropdown-menu py-1"
        >
          <button
            @click.stop="editProject"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            <EditIcon class="w-4 h-4" />
            <span>Edit Project</span>
          </button>
          <button
            @click.stop="deleteProject"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <TrashIcon class="w-4 h-4" />
            <span>Delete Project</span>
          </button>
        </div>
      </div>
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
          :key="conversation.conversation_id"
          class="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer project-accordion-conversation"
          :class="{ 'selected': selectedConversationId === conversation.conversation_id }"
          @click.stop="selectConversation(conversation)"
        >
          <MessageCircleIcon class="w-3 h-3 flex-shrink-0" />
          <span class="truncate">{{ conversation.conversation_name }}</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDownIcon, ChevronRightIcon, FolderIcon, MessageCircleIcon, PlusIcon, EditIcon, TrashIcon, MoreVerticalIcon, FolderOpenIcon } from 'lucide-vue-next'

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
  'add-conversation',
  'edit-project',
  'delete-project'
])

// State
const isExpanded = ref(props.expandedByDefault)
const showDropdown = ref(false)
const dropdownRef = ref(null)

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

const editProject = () => {
  showDropdown.value = false
  emit('edit-project', props.project)
}

const deleteProject = () => {
  showDropdown.value = false
  emit('delete-project', props.project)
}

// Dropdown handlers
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  showDropdown.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
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

<style scoped>
.max-h-96 {
  max-height: 24rem;
}
.max-h-0 {
  max-height: 0;
}

/* Ensure dropdown doesn't get cut off */
.relative {
  overflow: visible;
}

/* Ensure text truncation works properly */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Ensure minimum width is respected for truncation */
.min-w-0 {
  min-width: 0;
}

/* Dropdown specific positioning */
.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.25rem;
  z-index: 60;
  min-width: 10rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* Prevent dropdown from going outside viewport */
@media (max-width: 320px) {
  .dropdown-menu {
    right: 0;
    left: auto;
    transform: translateX(0);
  }
}
</style>