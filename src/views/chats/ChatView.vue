<template>
  <div class="flex h-full gap-4">
    <!-- Main Chat Area -->
    <div class="base-card bg-card flex flex-1 grow h-full overflow-scroll">
      <div class="flex-1 p-4 flex flex-col">
        <!-- Project & Conversation Info -->
        <div v-if="currentProject || currentConversation" class="mb-6">
          <div class="flex items-center gap-3 mb-2">
            <FolderIcon class="w-5 h-5 text-gray-600" />
            <span class="font-medium text-gray-900">{{ currentProject?.name || 'Select Project' }}</span>
            <ChevronRightIcon class="w-4 h-4 text-gray-400" />
            <MessageCircleIcon class="w-4 h-4 text-gray-600" />
            <span class="text-gray-700">{{ currentConversation?.title || 'New Conversation' }}</span>
          </div>
          <div class="text-sm text-gray-500">
            {{ conversationId === 'new' ? 'Start a new conversation' : `${currentConversation?.messageCount || 0} messages` }}
          </div>
        </div>

        <!-- Chat Messages Area -->
        <div class="bg-white grow mb-4 p-6 rounded-lg">
          <div v-if="messages.length === 0" class="text-center text-gray-500 flex items-center justify-center flex-col h-full">
            <MessageCircleIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Start a Conversation</h3>
            <p class="text-gray-600">{{ conversationId === 'new' ? 'Begin chatting about your project documents' : 'No messages yet in this conversation' }}</p>
          </div>
          
          <!-- Message bubbles would go here -->
          <div v-for="message in messages" :key="message.id" class="mb-4">
            <!-- Message rendering logic -->
          </div>
        </div>

        <!-- Chat Input -->
        <div class="relative">
          <input 
            v-model="messageText"
            type="text" 
            :placeholder="conversationId === 'new' ? 'Start your conversation...' : 'Write your message ...'"
            class="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            @keydown.enter="sendMessage"
          >
          <div class="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <button 
              @click="sendMessage"
              :disabled="!messageText.trim()"
              class="px-3 py-3 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendHorizonalIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Chat Tools Sidebar -->
    <ChatTool />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { FolderIcon, MessageCircleIcon, ChevronRightIcon, PaperclipIcon, SendHorizonalIcon } from 'lucide-vue-next'
import ChatTool from './ChatTool.vue'

const route = useRoute()

// Get route parameters
const projectId = computed(() => route.params.projectId)
const conversationId = computed(() => route.params.conversationId)

// Sample data (in real app, this would come from API/store)
const projects = ref([
  {
    id: 1,
    name: 'Project Wahiiid',
    conversations: [
      {
        id: 1,
        title: 'Summarize this document..',
        messageCount: 5,
        lastMessage: '2024-10-13',
        projectId: 1
      },
      {
        id: 2,
        title: 'Analyze financial report',
        messageCount: 3,
        lastMessage: '2024-10-12',
        projectId: 1
      }
    ]
  },
  {
    id: 2,
    name: 'Project Tsanii',
    conversations: [
      {
        id: 4,
        title: 'Legal document analysis',
        messageCount: 12,
        lastMessage: '2024-10-13',
        projectId: 2
      }
    ]
  }
])

// State
const messageText = ref('')
const messages = ref([])

// Computed
const currentProject = computed(() => {
  if (!projectId.value) return null
  return projects.value.find(p => p.id == projectId.value)
})

const currentConversation = computed(() => {
  if (!conversationId.value || conversationId.value === 'new') return null
  if (!currentProject.value) return null
  return currentProject.value.conversations.find(c => c.id == conversationId.value)
})

// Methods
const sendMessage = () => {
  if (!messageText.value.trim()) return
  
  console.log('Sending message:', messageText.value)
  console.log('Project ID:', projectId.value)
  console.log('Conversation ID:', conversationId.value)
  
  // Here you would typically send the message to your backend
  // For now, just clear the input
  messageText.value = ''
}

// Watch for route changes to load conversation data
watch([projectId, conversationId], ([newProjectId, newConversationId]) => {
  console.log('Route changed:', { projectId: newProjectId, conversationId: newConversationId })
  
  // Load messages for the conversation
  // This would typically be an API call
  messages.value = []
}, { immediate: true })

onMounted(() => {
  console.log('ChatView mounted with params:', {
    projectId: projectId.value,
    conversationId: conversationId.value
  })
})
</script>