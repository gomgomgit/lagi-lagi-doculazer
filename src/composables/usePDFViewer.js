import { ref } from 'vue'
import { useProjects } from './useProjects'

const { downloadProjectKnowledgeById } = useProjects()

// Global state for PDF viewer
const showPDFViewer = ref(false)
const selectedDocument = ref(null)

export function usePDFViewer() {
  /**
   * Open PDF viewer with document
   * @param {Object} document - Document object to view
   * @param {String|Number} projectId - Project ID for the document
   */
  const viewPDF = async (document, projectId) => {
    try {
      if (!projectId) {
        console.error('No project ID provided for PDF viewer')
        return
      }
      
      // Call API to download document blob
      const result = await downloadProjectKnowledgeById(projectId, document.knowledge_source_id)

      if (result && result.blob) {
        
        // Get content type from result or default to PDF
        const contentType = result.contentType || 'application/pdf'
        console.log('Using content type:', contentType)
        
        // Create blob URL directly from the blob
        let pdfBlob = result.blob
        
        // Only create new Blob if content type is missing or incorrect
        if (!pdfBlob.type || pdfBlob.type !== 'application/pdf') {
          console.log('Creating new blob with correct content type')
          pdfBlob = new Blob([pdfBlob], { type: 'application/pdf' })
        }
        
        const blobUrl = URL.createObjectURL(pdfBlob)
        
        // Set document with blob URL for PDF viewer
        selectedDocument.value = {
          ...document,
          url: blobUrl,
          blobUrl: blobUrl,
          contentType: pdfBlob.type
        }
        
        showPDFViewer.value = true
        
      } else {
        console.error('Failed to load PDF - no blob in result:', result)
        
        // Fallback to original document URL if available
        if (document.url) {
          console.log('Using fallback URL:', document.url)
          selectedDocument.value = document
          showPDFViewer.value = true
        } else {
          console.error('No URL available for PDF viewing')
          alert('Unable to load PDF. Please try downloading the file instead.')
        }
      }
    } catch (error) {
      console.error('Error loading PDF for view:', error)
      
      // Fallback to original document URL if available
      if (document.url) {
        selectedDocument.value = document
        showPDFViewer.value = true
        console.log(`Fallback to existing URL for: ${document.file_name}`)
      } else {
        alert('Error loading PDF: ' + error.message)
      }
    }
  }

  /**
   * Close PDF viewer
   */
  const closePDFViewer = () => {
    // Clean up blob URL if it was created
    if (selectedDocument.value?.blobUrl) {
      URL.revokeObjectURL(selectedDocument.value.blobUrl)
    }
    
    showPDFViewer.value = false
    selectedDocument.value = null
  }

  return {
    // State
    showPDFViewer,
    selectedDocument,
    
    // Methods
    viewPDF,
    closePDFViewer
  }
}
