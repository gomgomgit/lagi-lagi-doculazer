import { ref, computed } from 'vue'
import { 
  getDocuments, 
  getDocument, 
  uploadDocument, 
  deleteDocument
} from '@/services/documentsApi.js'

/**
 * Documents Composable
 * Provides reactive state management for documents
 */
export function useDocuments() {
  // State
  const documents = ref([])
  const currentDocument = ref(null)
  const loading = ref(false)
  const error = ref(null)
  
  // Pagination state
  const pagination = ref({
    currentPage: 1,
    perPage: 20,
    total: 0,
    totalPages: 1
  })

  // Computed
  const hasDocuments = computed(() => documents.value.length > 0)

  // Methods
  const fetchDocuments = async (page = 1) => {
    loading.value = true
    error.value = null
    
    try {
      const params = { page, per_page: pagination.value.perPage }
      const result = await getDocuments(params)
      
      if (result.success) {
        documents.value = result.data
        if (result.meta) {
          pagination.value = {
            currentPage: result.meta.current_page,
            perPage: result.meta.per_page,
            total: result.meta.total,
            totalPages: result.meta.last_page
          }
        }
      } else {
        error.value = result.error
      }
    } catch (err) {
      error.value = 'Failed to fetch documents'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const fetchDocument = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await getDocument(id)
      
      if (result.success) {
        currentDocument.value = result.data
        return result.data
      } else {
        error.value = result.error
        return null
      }
    } catch (err) {
      error.value = 'Failed to fetch document'
      console.error(err)
      return null
    } finally {
      loading.value = false
    }
  }

  const deleteDocumentById = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await deleteDocument(id)
      
      if (result.success) {
        documents.value = documents.value.filter(doc => doc.id !== id)
        
        if (currentDocument.value?.id === id) {
          currentDocument.value = null
        }
        
        return true
      } else {
        error.value = result.error
        return false
      }
    } catch (err) {
      error.value = 'Failed to delete document'
      console.error(err)
      return false
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    documents,
    currentDocument,
    loading,
    error,
    pagination,
    
    // Computed
    hasDocuments,
    
    // Methods
    fetchDocuments,
    fetchDocument,
    deleteDocumentById,
    clearError
  }
}