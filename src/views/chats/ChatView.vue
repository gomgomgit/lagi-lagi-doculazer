<template>
  <div class="flex h-full gap-4">
    <!-- Main Chat Area -->
    <div class="base-card bg-card flex flex-1 grow h-full overflow-scroll">
      <div class="flex-1 p-4 flex flex-col">
        <!-- Chat Header with Language Switch -->
        <div class="flex items-center justify-between mb-6">
          <!-- Project & Conversation Info -->
          <div v-if="currentProject || currentConversation" class="flex-1">
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
          
          <!-- Language Switcher -->
          <div class="flex items-center gap-1 bg-gray-100 rounded-full p-1">
            <button
              @click="setLanguage('id')"
              :class="[
                'px-3 py-1 text-sm font-semibold rounded-full transition-all duration-200',
                currentLanguage === 'id' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              ]"
            >
              <span class="flex items-center gap-1.5">
                ID
              </span>
            </button>
            <button
              @click="setLanguage('en')"
              :class="[
                'px-3 py-1 text-sm font-semibold rounded-full transition-all duration-200',
                currentLanguage === 'en' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              ]"
            >
              <span class="flex items-center gap-1.5">
                EN
              </span>
            </button>
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
            ref="messageInput"
            v-model="messageText"
            type="text" 
            :placeholder="conversationId === 'new' ? 'Start your conversation...' : 'Write your message ...'"
            class="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-16"
            @keydown="handleKeyDown"
            @input="handleInput"
          >
          
          <!-- Document Mention Dropdown -->
          <DocumentMentionDropdown
            :show="showMentionDropdown"
            :documents="availableDocuments"
            :query="mentionQuery"
            :project-id="projectId"
            @select="selectDocument"
            ref="mentionDropdown"
          />
          
          <!-- Selected Documents Badge -->
          <div 
            v-if="selectedDocuments.length > 0" 
            class="absolute left-3 -top-8 flex items-center gap-1 text-xs"
          >
            <span class="text-gray-500">Documents:</span>
            <span 
              v-for="doc in selectedDocuments" 
              :key="doc.id"
              class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1"
            >
              {{ doc.name }}
              <button 
                @click="removeDocument(doc.id)"
                class="ml-1 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                type="button"
              >
                <XIcon class="w-3 h-3" />
              </button>
            </span>
          </div>
          
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { FolderIcon, MessageCircleIcon, ChevronRightIcon, PaperclipIcon, SendHorizonalIcon, XIcon } from 'lucide-vue-next'
import ChatTool from './ChatTool.vue'
import DocumentMentionDropdown from '@/components/chat/DocumentMentionDropdown.vue'

const route = useRoute()

// Get route parameters
const projectId = computed(() => route.params.projectId)
const conversationId = computed(() => route.params.conversationId)

// Use projects composable
// const { 
//   projectsWithConversations, 
//   loading, 
//   error, 
//   fetchProjectsWithConversations 
// } = useProjects()

// Use projects from API instead of hardcoded data
// const projects = computed(() => projectsWithConversations.value || [])

// State
const messageText = ref('')
const messages = ref([])
const currentLanguage = ref('id') // Default to Indonesian

// Mention functionality state
const messageInput = ref(null)
const mentionDropdown = ref(null)
const showMentionDropdown = ref(false)
const mentionQuery = ref('')
const mentionStartPos = ref(-1)
const selectedDocuments = ref([])

// Documents data - using same structure as DocumentsView
const availableDocuments = ref([
  {
    id: 1,
    name: 'Annual_Report_2024.pdf',
    company: 'PT ABC',
    uploadDate: '2024-10-01',
    size: 2048576, // 2MB
    type: 'pdf',
    projectId: 1,
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 2,
    name: 'Financial_Statement_Q3.pdf',
    company: 'PT XYZ',
    uploadDate: '2024-09-15',
    size: 1536000, // 1.5MB
    type: 'pdf',
    projectId: 1,
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 3,
    name: 'Contract_Agreement.docx',
    company: 'CV DEF',
    uploadDate: '2024-10-10',
    size: 512000, // 500KB
    type: 'docx',
    projectId: 2,
    url: '#'
  },
  {
    id: 4,
    name: 'Meeting_Notes.txt',
    company: 'PT ABC',
    uploadDate: '2024-10-12',
    size: 25600, // 25KB
    type: 'txt',
    projectId: 1,
    url: '#'
  },
  {
    id: 5,
    name: 'Budget_Proposal_2025.pdf',
    company: 'PT XYZ',
    uploadDate: '2024-10-05',
    size: 3072000, // 3MB
    type: 'pdf',
    projectId: 2,
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 6,
    name: 'Due_Diligence_Report.pdf',
    company: 'CV DEF',
    uploadDate: '2024-10-08',
    size: 4096000, // 4MB
    type: 'pdf',
    projectId: 3,
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }
])

// Computed
// const currentProject = computed(() => {
//   if (!projectId.value) return null
//   return projects.value.find(p => p.id == projectId.value)
// })

// const currentConversation = computed(() => {
//   if (!conversationId.value || conversationId.value === 'new') return null
//   if (!currentProject.value) return null
//   return currentProject.value.conversations.find(c => c.id == conversationId.value)
// })

// Methods
const sendMessage = () => {
  if (!messageText.value.trim()) return
  
  console.log('Sending message:', messageText.value)
  console.log('Project ID:', projectId.value)
  console.log('Conversation ID:', conversationId.value)
  console.log('Language:', currentLanguage.value)
  console.log('Selected Documents:', selectedDocuments.value)
  
  // Here you would typically send the message to your backend
  // The message now includes document references
  const messageData = {
    text: messageText.value,
    projectId: projectId.value,
    conversationId: conversationId.value,
    language: currentLanguage.value,
    documents: selectedDocuments.value
  }
  
  console.log('Complete message data:', messageData)
  
  // Clear the input and selected documents
  messageText.value = ''
  selectedDocuments.value = []
  showMentionDropdown.value = false
  mentionQuery.value = ''
  mentionStartPos.value = -1
}

const setLanguage = (lang) => {
  currentLanguage.value = lang
  console.log('Language switched to:', lang)
  
  // This will be used as parameter for AI backend responses
}

// Document mention methods
const handleInput = (event) => {
  const input = event.target
  const value = input.value
  const cursorPos = input.selectionStart
  
  // If input is cleared, clear selected documents
  if (value.trim() === '') {
    selectedDocuments.value = []
  }
  
  // Check which documents are still mentioned in the text and remove badges for missing ones
  const currentMentions = []
  selectedDocuments.value.forEach(doc => {
    const mentionText = `@${doc.name}`
    if (value.includes(mentionText)) {
      currentMentions.push(doc)
    }
  })
  
  // Update selectedDocuments to only include documents still mentioned in text
  if (currentMentions.length !== selectedDocuments.value.length) {
    selectedDocuments.value = currentMentions
    console.log('Updated selected documents based on text content:', selectedDocuments.value)
  }
  
  // Find the last @ symbol before cursor
  const textBeforeCursor = value.substring(0, cursorPos)
  const lastAtPos = textBeforeCursor.lastIndexOf('@')
  
  if (lastAtPos !== -1) {
    // Check if there's a space after the @ (which would end the mention)
    const textAfterAt = textBeforeCursor.substring(lastAtPos + 1)
    if (!textAfterAt.includes(' ')) {
      // We're in a mention
      mentionStartPos.value = lastAtPos
      mentionQuery.value = textAfterAt
      showMentionDropdown.value = true
      return
    }
  }
  
  // Hide dropdown if not in mention context
  showMentionDropdown.value = false
  mentionQuery.value = ''
  mentionStartPos.value = -1
}

const handleKeyDown = (event) => {
  if (showMentionDropdown.value) {
    console.log('handleKeyDown - dropdown is open, key pressed:', event.key)
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        event.stopPropagation()
        mentionDropdown.value?.moveUp()
        break
      case 'ArrowDown':
        event.preventDefault()
        event.stopPropagation()
        mentionDropdown.value?.moveDown()
        break
      case 'Enter':
        console.log('Enter pressed in dropdown, calling selectCurrent')
        event.preventDefault()
        event.stopPropagation()
        mentionDropdown.value?.selectCurrent()
        return // Important: return early to prevent sendMessage
      case 'Escape':
        event.preventDefault()
        event.stopPropagation()
        showMentionDropdown.value = false
        mentionQuery.value = ''
        mentionStartPos.value = -1
        break
    }
  } else if (event.key === 'Enter') {
    // Jika dropdown tidak terbuka dan Enter ditekan, kirim pesan
    console.log('Enter pressed, sending message')
    event.preventDefault()
    sendMessage()
  }
}

const selectDocument = (document) => {
  console.log('selectDocument called with:', document)
  if (mentionStartPos.value === -1) {
    console.log('mentionStartPos is -1, returning')
    return
  }
  
  const input = messageInput.value
  const currentText = messageText.value
  
  // Replace the @query with the document mention
  const beforeMention = currentText.substring(0, mentionStartPos.value)
  const afterMention = currentText.substring(mentionStartPos.value + mentionQuery.value.length + 1)
  const mentionText = `@${document.name}`
  
  messageText.value = beforeMention + mentionText + ' ' + afterMention
  
  // Add to selected documents for sending with message
  if (!selectedDocuments.value.find(doc => doc.id === document.id)) {
    selectedDocuments.value.push(document)
  }
  
  // Hide dropdown
  showMentionDropdown.value = false
  mentionQuery.value = ''
  mentionStartPos.value = -1
  
  // Focus back to input and set cursor position
  nextTick(() => {
    const newCursorPos = beforeMention.length + mentionText.length + 1
    input.focus()
    input.setSelectionRange(newCursorPos, newCursorPos)
  })
}

const removeDocument = (documentId) => {
  // Remove document from selected documents
  selectedDocuments.value = selectedDocuments.value.filter(doc => doc.id !== documentId)
  
  // Also remove the @mention from the message text
  const removedDoc = availableDocuments.value.find(doc => doc.id === documentId)
  if (removedDoc) {
    const mentionText = `@${removedDoc.name}`
    messageText.value = messageText.value.replace(new RegExp(`${mentionText}\\s*`, 'g'), '')
  }
  
  console.log('Document removed:', documentId)
  console.log('Remaining selected documents:', selectedDocuments.value)
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
  
  // Fetch projects with conversations when component mounts
  // fetchProjectsWithConversations()
})
</script>