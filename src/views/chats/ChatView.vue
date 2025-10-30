<template>
  <div class="chat-view-container flex gap-4">
    <!-- Main Chat Area -->
    <div class="base-card bg-card flex flex-1 overflow-hidden">
      <div class="flex-1 flex flex-col">
        <!-- Chat Header with Language Switch -->
        <div class="flex items-center justify-between mb-6 flex-shrink-0">
          <!-- Project & Conversation Info -->
          <div class="flex-1">
            <div v-if="currentProject || currentConversation">
              <div class="flex items-center gap-3 mb-2">
                <FolderIcon class="w-5 h-5 text-gray-600" />
                <span class="font-medium text-gray-900">{{ currentProject?.name || 'Select Project' }}</span>
                <ChevronRightIcon class="w-4 h-4 text-gray-400" />
                <MessageCircleIcon class="w-4 h-4 text-gray-600" />
                <span class="text-gray-700">{{ currentConversation?.conversation_name || 'New Conversation' }}</span>
              </div>
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
        <div ref="messagesContainer" class="chat-messages-area mb-4 rounded-lg">
          <div v-if="messages.length === 0" class="text-center text-gray-500 flex items-center justify-center flex-col h-full">
            <MessageCircleIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Start a Conversation</h3>
            <p class="text-gray-600">{{ conversationId === 'new' ? 'Begin chatting about your project documents' : 'No messages yet in this conversation' }}</p>
          </div>
          
          <!-- Message bubbles would go here -->
          <div v-for="message in messages" :key="message.id" class="chat-message-container">
            <!-- User Message -->
            <div v-if="message.role === 'Human'" class="chat-message-row user">
              <div class="chat-message-bubble user">
                <div 
                  class="markdown-content"
                  v-html="parseMarkdownBasic(message.message)"
                ></div>
              </div>
            </div>
            <!-- AI Message -->
            <div v-else-if="message.role === 'AI'" class="chat-message-row ai">
              <div class="chat-message-bubble ai">
                <div 
                  class="markdown-content"
                  v-html="parseMarkdownBasic(message.message)"
                ></div>
              </div>
            </div>
            <!-- System/Error Messages -->
            <div v-else class="chat-message-row system">
              <div class="chat-message-bubble system">
                <div 
                  class="markdown-content"
                  v-html="parseMarkdownBasic(message.message)"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- Typing Indicator -->
          <div v-if="isTyping" class="chat-message-row ai">
            <div class="chat-typing-indicator">
              <div class="chat-typing-dots">
                <div class="chat-typing-dot"></div>
                <div class="chat-typing-dot"></div>
                <div class="chat-typing-dot"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="chat-input-area">
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
              {{ doc.file_name }}
              <button 
                @click="removeDocument(doc.knowledge_source_id)"
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
    <div class="chat-tool-sidebar">
      <ChatTool 
        ref="chatToolRef" 
        :documents="availableDocuments" 
        @filtersApplied="handleFiltersApplied"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FolderIcon, MessageCircleIcon, ChevronRightIcon, PaperclipIcon, SendHorizonalIcon, XIcon } from 'lucide-vue-next'
import ChatTool from './ChatTool.vue'
import DocumentMentionDropdown from '@/components/chat/DocumentMentionDropdown.vue'
import { useProjects } from '@/composables/useProjects'
import { useMarkdown } from '@/composables/useMarkdown'

const route = useRoute()
const router = useRouter()

// Get route parameters
const projectId = computed(() => route.params.projectId)
const conversationId = computed(() => route.params.conversationId)

// Use projects composable
const { 
  projectsWithConversations, 
  projectKnowledges,
  conversationHistory,
  loading, 
  error, 
  fetchProjectsWithConversations,
  fetchProjectKnowledges,
  fetchConversationHistory,
  sendMessage: sendApiMessage
} = useProjects()

// Use markdown composable
const { parseMarkdown, parseMarkdownSimple, parseMarkdownBasic, hasMarkdownSyntax } = useMarkdown()

// Use projects from API instead of hardcoded data
const projects = computed(() => projectsWithConversations.value || [])

// State
const messageText = ref('')
const messages = ref(conversationHistory.value || [])
const currentLanguage = ref('id') // Default to Indonesian
const isTyping = ref(false) // For AI typing indicator

// Mention functionality state
const messageInput = ref(null)
const messagesContainer = ref(null)
const mentionDropdown = ref(null)
const chatToolRef = ref(null)
const showMentionDropdown = ref(false)
const mentionQuery = ref('')
const mentionStartPos = ref(-1)
const selectedDocuments = ref([])
const currentFilteredDocuments = ref([])

// Documents data - will be fetched from API
const availableDocuments = computed(() => {
  return projectKnowledges.value || []
})

// Computed
const currentProject = computed(() => {
  if (!projectId.value) return null
  return projects.value.find(p => p.id == projectId.value)
})

const currentConversation = computed(() => {
  console.log('Computing currentConversation for ID:', conversationId.value)
  if (!conversationId.value || conversationId.value === 'new') return null
  if (!currentProject.value) return null
  console.log('Available conversations:', currentProject.value.conversations)
  return currentProject.value.conversations?.find(c => c.conversation_id == conversationId.value)
})

// Computed property to get filtered documents from ChatTool
const filteredDocuments = computed(() => {
  if (!chatToolRef.value) return []
  return chatToolRef.value.filteredFiles || []
})

// Method to get current filtered documents
const getFilteredDocuments = () => {
  if (!chatToolRef.value) {
    console.log('ChatTool ref not available')
    return []
  }
  
  const filtered = chatToolRef.value.filteredFiles || []
  console.log('Current filtered documents:', filtered)
  return filtered
}

// Method to get applied filters
const getAppliedFilters = () => {
  if (!chatToolRef.value) {
    console.log('ChatTool ref not available')
    return []
  }
  
  const filters = chatToolRef.value.appliedFilters || []
  console.log('Current applied filters:', filters)
  return filters
}

// Handle filters applied event from ChatTool
const handleFiltersApplied = (data) => {
  console.log('🎯 Filters applied event received:', data)
  console.log('📄 Filtered files count:', data.filteredFiles.length)
  console.log('🔍 Applied filters count:', data.appliedFilters.length)
  
  // Store filtered data in reactive state
  currentFilteredDocuments.value = data.filteredFiles
  
  // Now you can access the filtered data
  const filteredFiles = data.filteredFiles
  const appliedFilters = data.appliedFilters
  
  // Log the actual filtered documents for debugging
  console.log('📋 Current filtered documents via event:', filteredFiles.map(f => f.name))
  
  // You can use this data for various purposes:
  // 1. Show notification
  if (filteredFiles.length > 0) {
    console.log(`Filter applied: Found ${filteredFiles.length} documents`)
  } else {
    console.log('Filter applied: No documents match the criteria')
  }
}

// Methods
const sendMessage = async () => {
  if (!messageText.value.trim()) return

  // Add user message to chat immediately for better UX
  const userMessage = {
    id: Date.now(),
    role: 'Human',
    message: messageText.value
  }
  messages.value.push(userMessage)
  scrollToBottom()

  console.log('User message added:', userMessage)
  
  // Store the message text and selected documents before clearing
  const messageToSend = messageText.value
  const documentsToSend = [...selectedDocuments.value]
  
  // Clear the input and selected documents immediately for better UX
  messageText.value = ''
  selectedDocuments.value = []
  showMentionDropdown.value = false
  mentionQuery.value = ''
  mentionStartPos.value = -1
  
  // Show typing indicator
  isTyping.value = true
  
  try {
    // Send message to API with mentioned documents
    // Use empty string for conversation_id when it's 'new'
    const apiConversationId = conversationId.value === 'new' ? undefined : conversationId.value
    
    console.log('Sending message with documents:', {
      message: messageToSend,
      documents: [...documentsToSend, ...currentFilteredDocuments.value], 
      conversationId: apiConversationId
    })
    
    const response = await sendApiMessage(
      projectId.value, 
      messageToSend, 
      apiConversationId,
      [...documentsToSend, ...currentFilteredDocuments.value]
    )
    
    if (response) {
      const aiMessage = {
        id: response.conversation_id,
        role: 'AI',
        message: response.ai_message,
      }
      messages.value.push(aiMessage)
      scrollToBottom()
      
      // If this was a new conversation, update the URL and refresh sidebar
      if (conversationId.value === 'new' && response.conversation_id) {
        await handleNewConversationCreated(response)
      }
    } else {
      // Handle error case
      const errorMessage = {
        id: Date.now() + 1,
        role: 'AI',
        message: 'Sorry, I encountered an error while processing your message. Please try again.'
      }
      messages.value.push(errorMessage)
      scrollToBottom()
    }
  } catch (error) {
    console.error('Error sending message:', error)
  } finally {
    // Hide typing indicator
    isTyping.value = false
  }
}

const setLanguage = (lang) => {
  currentLanguage.value = lang
  console.log('Language switched to:', lang)
}

// Scroll to bottom of messages
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Document mention methods
const handleInput = (event) => {
  const input = event.target
  const value = input.value
  const cursorPos = input.selectionStart
  
  // If input is cleared, clear selected documents
  if (value.trim() === '') {
    selectedDocuments.value = []
    console.log('Input cleared, selectedDocuments cleared')
    return
  }
  
  const textBeforeCursor = value.substring(0, cursorPos)
  const lastAtPos = textBeforeCursor.lastIndexOf('@')
  
  // If we're not currently typing a mention, check for removed documents
  if (lastAtPos === -1 || textBeforeCursor.substring(lastAtPos + 1).includes(' ')) {
    const currentMentions = []
    selectedDocuments.value.forEach(doc => {
      const docName = doc.file_name
      const mentionText = `@${docName}`
      if (value.includes(mentionText)) {
        currentMentions.push(doc)
      }
    })
    
    // Update selectedDocuments only if there's a real change
    if (currentMentions.length !== selectedDocuments.value.length) {
      selectedDocuments.value = currentMentions
      console.log('Updated selected documents:', selectedDocuments.value.map(d => d.file_name))
    }
  }
  
  // Handle mention dropdown logic
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
    event.preventDefault()
    sendMessage()
  }
}

const selectDocument = (document) => {
  if (mentionStartPos.value === -1) {
    return
  }
  
  const input = messageInput.value
  const currentText = messageText.value
  
  // Replace the @query with the document mention
  const beforeMention = currentText.substring(0, mentionStartPos.value)
  const afterMention = currentText.substring(mentionStartPos.value + mentionQuery.value.length + 1)
  // Handle different possible field names from API (name, filename, title, etc.)
  const docName = document.file_name
  const mentionText = `@${docName}`
  
  messageText.value = beforeMention + mentionText + ' ' + afterMention
  
  console.log('Document selected:', document.file_name)
  console.log('Current selected documents before adding:', selectedDocuments.value.map(d => d.file_name))
  
  // Add to selected documents for sending with message
  if (!selectedDocuments.value.find(doc => doc.id === document.id)) {
    console.log('Adding document to selected documents:', document.file_name)
    selectedDocuments.value.push(document)
    console.log('Document added to selected documents:', document.file_name)
  } else {
    selectedDocuments.value.push(document)
    console.log('Document already in selected documents:', document.file_name)
  }
  
  console.log('Current selected documents after adding:', selectedDocuments.value.map(d => d.file_name))
  
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
  selectedDocuments.value = selectedDocuments.value.filter(doc => doc.knowledge_source_id !== documentId)
  
  // Also remove the @mention from the message text
  const removedDoc = availableDocuments.value.find(doc => doc.knowledge_source_id === documentId)
  if (removedDoc) {
    // Handle different possible field names from API (name, filename, title, etc.)
    const docName = removedDoc.file_name
    const mentionText = `@${docName}`
    messageText.value = messageText.value.replace(new RegExp(`${mentionText}\\s*`, 'g'), '')
  }
  
  // console.log('Document removed:', documentId)
  // console.log('Remaining selected documents:', selectedDocuments.value)
}

// Function to load conversation history
const loadConversationHistory = async (projectId, conversationId) => {
  if (!projectId || !conversationId || conversationId === 'new') {
    console.log('Skipping history load for new conversation or missing params')
    messages.value = []
    return
  }

  try {
    const history = await fetchConversationHistory(projectId, conversationId)
    
    if (history && history.length > 0) {
      messages.value = history
      // console.log('Conversation history loaded:', history)
      
      // Auto scroll to bottom after loading conversation history
      nextTick(() => {
        scrollToBottom()
      })
    }
  } catch (error) {
    // console.error('Error loading conversation history:', error)
    messages.value = []
  }
}

// Function to load project knowledge documents
const loadProjectKnowledge = async (projectId) => {
  if (!projectId) {
    console.log('Skipping knowledge load for missing project ID')
    return
  }

  try {
    console.log(`Loading project knowledge for project ${projectId}`)
    await fetchProjectKnowledges(projectId)
    console.log('Project knowledge loaded:', projectKnowledges.value)
  } catch (error) {
    console.error('Error loading project knowledge:', error)
  }
}

// Function to handle when a new conversation is created
const handleNewConversationCreated = async (response) => {
  try {
    console.log('New conversation created:', response)
    
    // Extract conversation details from response
    const newConversationId = response.conversation_id
    
    // Create conversation title from response or use first message as fallback
    let conversationTitle = response.conversation_title || response.title
    console.log('Initial conversation title from response:', response)
    if (!conversationTitle && messages.value.length > 0) {
      // Use first 50 characters of the first user message as title
      const firstUserMessage = messages.value.find(msg => msg.role === 'Human')
      if (firstUserMessage) {
        conversationTitle = firstUserMessage.message.substring(0, 50).trim()
        if (firstUserMessage.message.length > 50) {
          conversationTitle += '...'
        }
      }
    }
    conversationTitle = conversationTitle || 'New Conversation'
    
    // Update URL to the new conversation without causing a full page reload
    await router.replace({
      name: 'chat-conversation',
      params: {
        projectId: projectId.value,
        conversationId: newConversationId
      }
    })
    
    // Wait a moment for the route to update, then refresh projects list
    await nextTick()
    await fetchProjectsWithConversations()
    
    console.log(`Updated URL to conversation ${newConversationId}: ${conversationTitle}`)
    console.log('Sidebar should now show the new conversation as selected')
  } catch (error) {
    console.error('Error handling new conversation creation:', error)
  }
}

// Watch for route changes to load conversation data
watch([projectId, conversationId], async ([newProjectId, newConversationId]) => {
  console.log('Route changed:', { projectId: newProjectId, conversationId: newConversationId })
  
  // Load project knowledge documents when project changes
  if (newProjectId) {
    await loadProjectKnowledge(newProjectId)
  }
  
  // Load conversation history
  await loadConversationHistory(newProjectId, newConversationId)
}, { immediate: true })

// Watch for messages changes to auto scroll to bottom
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

// Watch chatToolRef to ensure it's properly mounted
watch(chatToolRef, (newRef) => {
  if (newRef) {
    console.log('✅ ChatTool ref is now available:', newRef)
    console.log('🔧 Available methods:', Object.keys(newRef))
  } else {
    console.log('❌ ChatTool ref is not available')
  }
}, { immediate: true })

onMounted(() => {
  console.log('ChatView mounted with params:', {
    projectId: projectId.value,
    conversationId: conversationId.value
  })
  
  // Fetch projects with conversations when component mounts
  fetchProjectsWithConversations()
  
  // Expose methods to window for testing/debugging (development only)
  if (process.env.NODE_ENV === 'development') {
    window.getChatFilteredDocuments = getFilteredDocuments
    window.getChatAppliedFilters = getAppliedFilters
    window.chatToolRef = chatToolRef
    window.currentFilteredDocuments = currentFilteredDocuments
    window.testChatToolRef = () => {
      console.log('ChatTool ref status:', {
        available: !!chatToolRef.value,
        filteredFiles: chatToolRef.value?.filteredFiles || 'Not available',
        appliedFilters: chatToolRef.value?.appliedFilters || 'Not available'
      })
    }
    console.log('🔧 Debug methods exposed:', [
      'getChatFilteredDocuments()', 
      'getChatAppliedFilters()', 
      'chatToolRef', 
      'currentFilteredDocuments',
      'testChatToolRef()'
    ])
  }
})
</script>