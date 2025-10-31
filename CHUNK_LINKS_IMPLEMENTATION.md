# Chunk Links Testing Guide

## 📋 Implementation Summary

Saya telah berhasil mengimplementasikan event listener untuk chunk references di ChatView sesuai dengan permintaan Anda. Berikut adalah struktur yang telah dibuat:

### 🔧 Implementasi di ChatView.vue

#### 1. Event Listener Setup
```javascript
const setupChunkLinkEventListener = () => {
  nextTick(() => {
    const container = messagesContainer.value
    
    if (!container) {
      console.warn('Messages container not found')
      return
    }
    
    // Remove existing listener to prevent duplicates
    container.removeEventListener('click', handleChunkLinkClick)
    
    // Add new listener
    container.addEventListener('click', handleChunkLinkClick)
    console.log('✅ Chunk link event listener setup complete')
  })
}
```

#### 2. Click Handler
```javascript
const handleChunkLinkClick = (e) => {
  const link = e.target.closest('a')
  
  if (link) {
    const href = link.getAttribute('href')
    const chunkId = link.getAttribute('data-chunk-id')
    
    // Check if this is a chunk reference link
    if (href && href.startsWith('#CHUNK-') && chunkId) {
      e.preventDefault()
      console.log('🔗 Chunk link clicked:', {
        href,
        chunkId,
        linkText: link.textContent,
        fullLink: link.outerHTML
      })
      
      // Handle the chunk click
      handleChunkReference(chunkId, link)
    }
  }
}
```

#### 3. Chunk Reference Handler
```javascript
const handleChunkReference = (chunkId, linkElement) => {
  console.log('📄 Processing chunk reference:', chunkId)
  
  // Find related document from available documents
  const relatedDoc = availableDocuments.value.find(doc => 
    doc.chunks && doc.chunks.some(chunk => chunk.chunk_id === chunkId)
  )
  
  if (relatedDoc) {
    console.log('📋 Found related document:', {
      fileName: relatedDoc.file_name,
      chunkId: chunkId
    })
    
    // Add visual feedback to the clicked link
    linkElement.style.backgroundColor = '#e0f2fe'
    linkElement.style.borderColor = '#0284c7'
    
    setTimeout(() => {
      linkElement.style.backgroundColor = ''
      linkElement.style.borderColor = ''
    }, 2000)
    
  } else {
    console.warn('⚠️ No related document found for chunk:', chunkId)
  }
}
```

### 🚀 Cara Menggunakan

#### 1. Event Listener Automatic Setup
- Event listener otomatis di-setup saat component `onMounted()`
- Re-setup otomatis saat ada pesan baru (watch `messages`)
- Menggunakan `messagesContainer` ref yang sudah ada

#### 2. Format Chunk Reference
Untuk membuat chunk reference di markdown, gunakan format:
```markdown
Referensi dokumen: [1](#CHUNK-abc-123-def-456)
```

#### 3. HTML Output
Akan dikonversi menjadi:
```html
<a href="#CHUNK-abc-123-def-456" 
   class="markdown-link markdown-chunk-link" 
   data-chunk-id="CHUNK-abc-123-def-456" 
   title="Reference to document chunk 1">
  [1]
</a>
```

### 🎯 Features

#### 1. Event Delegation
- Menggunakan event delegation pada container level
- Tidak perlu attach listener ke setiap link individual
- Otomatis handle link baru yang ditambahkan

#### 2. Link Detection
- Deteksi otomatis chunk links berdasarkan `href` dan `data-chunk-id`
- Prevent default behavior untuk chunk links
- Preserve normal behavior untuk regular links

#### 3. Visual Feedback
- Memberikan highlight visual saat chunk diklik
- Temporary styling dengan auto-reset setelah 2 detik
- Console logging untuk debugging

#### 4. Document Matching
- Mencari dokumen terkait berdasarkan chunk ID
- Support untuk struktur `doc.chunks` array
- Warning jika dokumen tidak ditemukan

### 🧪 Testing

#### Untuk test implementasi ini:

1. **Buat pesan dengan chunk reference:**
```markdown
Lihat referensi dokumen [1](#CHUNK-abc-123) dan [2](#CHUNK-def-456) untuk detail lebih lanjut.
```

2. **Check console logs:**
- Saat mount: "✅ Chunk link event listener setup complete"
- Saat klik: "🔗 Chunk link clicked: {...}"
- Processing: "📄 Processing chunk reference: CHUNK-abc-123"

3. **Visual feedback:**
- Link akan berubah warna background ke biru muda
- Border akan berubah ke biru tua
- Reset otomatis setelah 2 detik

### 🔧 Customization

Anda bisa customize behavior di `handleChunkReference()`:

```javascript
const handleChunkReference = (chunkId, linkElement) => {
  // Custom actions yang bisa dilakukan:
  
  // 1. Navigate to document
  // router.push({ name: 'document-detail', params: { chunkId } })
  
  // 2. Show chunk content in sidebar
  // showChunkContent(chunkId)
  
  // 3. Highlight document in ChatTool
  // highlightDocumentInChatTool(chunkId)
  
  // 4. Open document viewer
  // openDocumentViewer(chunkId)
  
  // 5. Send API request for chunk details
  // fetchChunkDetails(chunkId)
}
```

### ✅ Implementation Complete

- ✅ Event listener setup di `messagesContainer`
- ✅ Chunk link detection dan handling
- ✅ Visual feedback untuk user interaction
- ✅ Console logging untuk debugging
- ✅ Document matching logic
- ✅ Automatic re-setup saat ada pesan baru
- ✅ Prevention of duplicate listeners

Implementasi sekarang ready untuk testing dan dapat di-customize sesuai kebutuhan aplikasi Anda!