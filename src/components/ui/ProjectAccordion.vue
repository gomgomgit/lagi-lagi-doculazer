<template>
  <div class="space-y-1">
    <!-- Project Header -->
    <div  
      class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors project-accordion-header group"
      :class="{ 'expanded': props.isExpanded }"
    >
      <div 
        class="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
      >
        <FolderOpenIcon v-if="props.isExpanded" @click="toggleExpanded" class="w-4 h-4 flex-shrink-0" />
        <FolderIcon v-else @click="toggleExpanded" class="w-4 h-4 flex-shrink-0" />
        <span 
          @click="handleProjectClick" 
          class="flex-1 truncate min-w-0 hover:text-blue-600 transition-colors"
          :title="`View all conversations in ${project.name}`"
        >
          {{ project.name }}
        </span>
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
      <div v-show="props.isExpanded" class="ml-3 space-y-1">
        <div 
          v-for="conversation in project.conversations" 
          :key="conversation.conversation_id"
          class="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer project-accordion-conversation group"
          :class="{ 'selected': selectedConversationId === conversation.conversation_id }"
          @click.stop="selectConversation(conversation)"
        >
          <div 
            class="flex items-center gap-2 flex-1 min-w-0"
          >
            <MessageCircleIcon class="w-3 h-3 flex-shrink-0" />
            <span class="truncate">{{ conversation.conversation_name }}</span>
          </div>
          
          <!-- Conversation Actions Dropdown -->
          <div class="relative flex-shrink-0" :data-conversation-dropdown="conversation.conversation_id">
            <button
              @click.stop="toggleConversationDropdown(conversation.conversation_id)"
              class="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-all opacity-0 group-hover:opacity-100"
              title="Conversation Options"
            >
              <MoreVerticalIcon class="w-3 h-3" />
            </button>
            
            <!-- Dropdown Menu for Conversation -->
            <div 
              v-if="showConversationDropdown === conversation.conversation_id"
              class="dropdown-menu py-1"
            >
              <button
                @click.stop="editConversation(conversation)"
                class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                <EditIcon class="w-3 h-3" />
                <span>Rename Chat</span>
              </button>
              <hr class="my-1 border-gray-200">
              <button
                @click.stop="deleteConversation(conversation)"
                class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <TrashIcon class="w-3 h-3" />
                <span>Delete Chat</span>
              </button>
            </div>
          </div>
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
  isExpanded: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'conversation-selected',
  'add-conversation',
  'edit-project',
  'delete-project',
  'edit-conversation',
  'delete-conversation',
  'toggle-expanded',
  'project-clicked'
])
const showDropdown = ref(false)
const showConversationDropdown = ref(null) // Store conversation ID that has dropdown open
const dropdownRef = ref(null)

// Methods
const toggleExpanded = () => {
  emit('toggle-expanded', props.project.id)
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
  // Close conversation dropdown if project dropdown is opened
  if (showDropdown.value) {
    showConversationDropdown.value = null
  }
}

const closeDropdown = () => {
  showDropdown.value = false
}

// Conversation dropdown handlers
const toggleConversationDropdown = (conversationId) => {
  if (showConversationDropdown.value === conversationId) {
    showConversationDropdown.value = null
  } else {
    showConversationDropdown.value = conversationId
    // Close project dropdown if conversation dropdown is opened
    showDropdown.value = false
  }
}

const closeConversationDropdown = () => {
  showConversationDropdown.value = null
}

// Conversation action handlers
const editConversation = (conversation) => {
  closeConversationDropdown()
  emit('edit-conversation', conversation)
}

const deleteConversation = (conversation) => {
  closeConversationDropdown()
  emit('delete-conversation', conversation)
}

// Handle project name click
const handleProjectClick = () => {
  emit('project-clicked', props.project)
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  // Close project dropdown
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
  
  // Close conversation dropdown
  if (showConversationDropdown.value) {
    const conversationDropdownRef = document.querySelector(`[data-conversation-dropdown="${showConversationDropdown.value}"]`)
    if (conversationDropdownRef && !conversationDropdownRef.contains(event.target)) {
      closeConversationDropdown()
    } else {
      // Check if click is outside any conversation dropdown
      const allConversationDropdowns = document.querySelectorAll('[data-conversation-dropdown]')
      let clickedOutside = true
      allConversationDropdowns.forEach(dropdown => {
        if (dropdown.contains(event.target)) {
          clickedOutside = false
        }
      })
      if (clickedOutside) {
        closeConversationDropdown()
      }
    }
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
  z-index: 100;
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