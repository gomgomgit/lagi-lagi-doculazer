<template>
  <div class="chat-view-container flex gap-4">
    <!-- Main Chat Area -->
    <div class="base-card bg-card flex flex-1 overflow-hidden">
      <div class="flex-1 flex flex-col">
        <!-- Chat Header with Language Switch -->
        <div class="flex items-center justify-between mb-6 flex-shrink-0">
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
    <div class="chat-tool-sidebar">
      <ChatTool />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { FolderIcon, MessageCircleIcon, ChevronRightIcon, PaperclipIcon, SendHorizonalIcon, XIcon } from 'lucide-vue-next'
import ChatTool from './ChatTool.vue'
import DocumentMentionDropdown from '@/components/chat/DocumentMentionDropdown.vue'
import { useProjects } from '@/composables/useProjects'
import { useMarkdown } from '@/composables/useMarkdown'

const route = useRoute()

// Get route parameters
const projectId = computed(() => route.params.projectId)
const conversationId = computed(() => route.params.conversationId)

// Use projects composable
const { 
  projectsWithConversations, 
  conversationHistory,
  loading, 
  error, 
  fetchProjectsWithConversations,
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
const currentProject = computed(() => {
  if (!projectId.value) return null
  return projects.value.find(p => p.id == projectId.value)
})

const currentConversation = computed(() => {
  if (!conversationId.value || conversationId.value === 'new') return null
  if (!currentProject.value) return null
  return currentProject.value.conversations?.find(c => c.id == conversationId.value)
})

// Methods
const sendMessage = async () => {
  if (!messageText.value.trim()) return
  
  console.log('Sending message:', messageText.value)
  console.log('Project ID:', projectId.value)
  console.log('Conversation ID:', conversationId.value)
  console.log('Language:', currentLanguage.value)
  console.log('Selected Documents:', selectedDocuments.value)
  
  // Add user message to chat immediately for better UX
  const userMessage = {
    id: Date.now(),
    role: 'Human',
    message: messageText.value,
    timestamp: new Date().toISOString()
  }
  messages.value.push(userMessage)
  scrollToBottom()
  
  // Store the message text before clearing
  const messageToSend = messageText.value
  
  // Clear the input and selected documents immediately for better UX
  messageText.value = ''
  selectedDocuments.value = []
  showMentionDropdown.value = false
  mentionQuery.value = ''
  mentionStartPos.value = -1
  
  // Show typing indicator
  isTyping.value = true
  
  try {
    // Send message to API
    const response = await sendApiMessage(
      projectId.value, 
      messageToSend, 
      conversationId.value
    )
    
    if (response) {
      const aiMessage = {
        id: response.conversation_id,
        role: 'AI',
        message: response.ai_message,
      }
      messages.value.push(aiMessage)
      scrollToBottom()
    } else {
      // Handle error case
      const errorMessage = {
        id: Date.now() + 1,
        role: 'AI',
        message: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date().toISOString()
      }
      messages.value.push(errorMessage)
      console.error('Failed to get response from API')
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
  
  // This will be used as parameter for AI backend responses
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

// Function to load conversation history
const loadConversationHistory = async (projectId, conversationId) => {
  if (!projectId || !conversationId || conversationId === 'new') {
    console.log('Skipping history load for new conversation or missing params')
    messages.value = []
    return
  }

  try {
    console.log(`Loading conversation history for project ${projectId}, conversation ${conversationId}`)
    const history = await fetchConversationHistory(projectId, conversationId)
    
    if (history && history.length > 0) {
      messages.value = history
      console.log('Conversation history loaded:', history)
    } else {
      console.log('No conversation history found, showing demo messages')
      // Demo messages for styling demonstration
      messages.value = [
        {
          id: 1,
          role: 'AI',
          message: `Hello! I'm your **AI assistant**. I can help you analyze documents and answer questions about your projects. 

Here's what I can do:
- Analyze *financial reports* and documents
- Answer questions with **detailed explanations**
- Provide \`code examples\` when needed
- Create tables and lists

How can I assist you today?`,
          timestamp: new Date(Date.now() - 60000).toISOString()
        },
        {
          id: 2,
          role: 'Human',
          message: 'Hi! Can you help me understand the **key findings** in the annual report? Please provide a summary with some examples.',
          timestamp: new Date(Date.now() - 30000).toISOString()
        },
        {
          id: 3,
          role: 'AI',
          message: `I'd be happy to help you with the annual report analysis! Here's what I can provide:

## Key Areas I Can Analyze:

### 1. Financial Performance
- **Revenue growth** and trends
- *Profit margins* and cost analysis
- Cash flow statements

### 2. Strategic Initiatives
- Market expansion plans
- Investment priorities
- Risk management strategies

### Example Code for Analysis:
\`\`\`python
def analyze_revenue_growth(data):
    growth_rate = (current_year - previous_year) / previous_year
    return growth_rate * 100
\`\`\`

> **Note**: I'll need access to the specific document to provide detailed insights.

Would you like me to focus on any **specific section** of the report?`,
          timestamp: new Date().toISOString()
        }
      ]
    }
    
    // Scroll to bottom after loading messages
    scrollToBottom()
  } catch (error) {
    console.error('Error loading conversation history:', error)
    messages.value = []
  }
}

// Watch for route changes to load conversation data
watch([projectId, conversationId], async ([newProjectId, newConversationId]) => {
  console.log('Route changed:', { projectId: newProjectId, conversationId: newConversationId })
  
  // Load conversation history
  await loadConversationHistory(newProjectId, newConversationId)
}, { immediate: true })

onMounted(() => {
  console.log('ChatView mounted with params:', {
    projectId: projectId.value,
    conversationId: conversationId.value
  })
  
  // Fetch projects with conversations when component mounts
  fetchProjectsWithConversations()
})
</script>