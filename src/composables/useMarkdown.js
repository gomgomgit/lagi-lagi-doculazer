import { marked } from 'marked'
import createDOMPurify from 'isomorphic-dompurify'

// Initialize DOMPurify with window context if available
const DOMPurify = createDOMPurify(typeof window !== 'undefined' ? window : undefined)

// Configure marked options
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // GitHub Flavored Markdown
  headerIds: false, // Disable header IDs
  mangle: false, // Don't mangle email addresses
})

// Custom renderer for better styling
const renderer = new marked.Renderer()

// Custom code block renderer
renderer.code = function(code, language) {
  const validLanguage = language && language.match(/^[a-zA-Z0-9_+-]*$/) ? language : ''
  return `<pre class="markdown-code-block"><code class="language-${validLanguage}">${code}</code></pre>`
}

// Custom inline code renderer
renderer.codespan = function(code) {
  return `<code class="markdown-inline-code">${code}</code>`
}

// Custom blockquote renderer
renderer.blockquote = function(quote) {
  return `<blockquote class="markdown-blockquote">${quote}</blockquote>`
}

// Custom list renderer
renderer.list = function(body, ordered, start) {
  const type = ordered ? 'ol' : 'ul'
  const className = ordered ? 'markdown-ordered-list' : 'markdown-unordered-list'
  const startattr = (ordered && start !== 1) ? ` start="${start}"` : ''
  return `<${type} class="${className}"${startattr}>${body}</${type}>`
}

// Custom list item renderer
renderer.listitem = function(text) {
  return `<li class="markdown-list-item">${text}</li>`
}

// Custom table renderer
renderer.table = function(header, body) {
  return `<div class="markdown-table-wrapper"><table class="markdown-table"><thead>${header}</thead><tbody>${body}</tbody></table></div>`
}

// Custom link renderer with security and chunk handling
renderer.link = function(href, title, text) {
  const titleAttr = title ? ` title="${title}"` : ''
  
  // Check if this is a chunk reference link
  if (href && href.startsWith('#CHUNK-')) {
    const chunkId = href.replace('#', '')
    return `<a href="${href}" class="markdown-link markdown-chunk-link" data-chunk-id="${chunkId}" title="Reference to document chunk ${text}">${text}</a>`
  }
  
  // Check if this is a knowledge/document reference link
  if (href && (href.startsWith('#KNOWLEDGE-') || href.startsWith('knowledge://'))) {
    const knowledgeId = href.replace('#KNOWLEDGE-', '').replace('knowledge://', '')
    return `<a href="${href}" class="markdown-link markdown-knowledge-link" data-knowledge-id="${knowledgeId}" title="View document: ${text}">${text}</a>`
  }
  
  // Regular link handling with security
  const safeHref = href.startsWith('javascript:') ? '#' : href
  return `<a href="${safeHref}" class="markdown-link" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`
}

// Custom image renderer
renderer.image = function(href, title, text) {
  const titleAttr = title ? ` title="${title}"` : ''
  const altAttr = text ? ` alt="${text}"` : ''
  return `<img src="${href}" class="markdown-image"${altAttr}${titleAttr} />`
}

// Custom heading renderer
renderer.heading = function(text, level) {
  return `<h${level} class="markdown-heading markdown-heading-${level}">${text}</h${level}>`
}

// Custom paragraph renderer
renderer.paragraph = function(text) {
  return `<p class="markdown-paragraph">${text}</p>`
}

// Custom strong renderer
renderer.strong = function(text) {
  return `<strong class="markdown-strong">${text}</strong>`
}

// Custom emphasis renderer
renderer.em = function(text) {
  return `<em class="markdown-emphasis">${text}</em>`
}

// Custom highlight renderer (for ==highlight== syntax)
renderer.text = function(text) {
  // Process highlight syntax ==text==
  const highlighted = text.replace(/==([^=]+)==/g, '<mark class="markdown-highlight">$1</mark>')
  return highlighted
}

// Set the custom renderer
marked.setOptions({ renderer })

// Helper function to ensure DOMPurify returns a string
const sanitizeToString = (htmlString) => {
  try {
    // Try different DOMPurify configurations to ensure string output
    let result = DOMPurify.sanitize(htmlString, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'blockquote',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span', 'mark'
      ],
      ALLOWED_ATTR: [
        'href', 'title', 'alt', 'src', 'class',
        'target', 'rel', 'start', 'data-chunk-id', 'onclick'
      ],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false,
      RETURN_TRUSTED_TYPE: false
    })
    
    // Handle different possible return types
    if (typeof result === 'string') {
      return result
    } else if (result && typeof result.toString === 'function') {
      return result.toString()
    } else if (result && result.outerHTML) {
      return result.outerHTML
    } else if (result && result.innerHTML) {
      return result.innerHTML
    } else {
      console.warn('DOMPurify returned unexpected type:', typeof result, result)
      return htmlString // Return original HTML if we can't convert
    }
  } catch (error) {
    console.error('DOMPurify error:', error)
    return htmlString // Return original HTML if sanitization fails
  }
}

export function useMarkdown() {
  
  /**
   * Convert markdown text to sanitized HTML
   * @param {string} markdownText - The markdown text to convert
   * @returns {string} - Sanitized HTML string
   */
  const parseMarkdown = (markdownText) => {
    if (!markdownText || typeof markdownText !== 'string') {
      return ''
    }

    try {
      // Parse markdown to HTML
      const html = marked.parse(markdownText)
      console.log('Parsed HTML from marked:', html)
      console.log('HTML type:', typeof html)
      
      // Use helper function to ensure string output
      const sanitizedHtml = sanitizeToString(html)
      
      console.log('Final sanitized HTML type:', typeof sanitizedHtml)
      console.log('Final sanitized HTML content:', sanitizedHtml)
      
      return sanitizedHtml
    } catch (error) {
      console.error('Error parsing markdown:', error)
      return markdownText // Return original text if parsing fails
    }
  }

  /**
   * Simple markdown parser without DOMPurify (fallback)
   * @param {string} markdownText - The markdown text to convert
   * @returns {string} - HTML string
   */
  const parseMarkdownSimple = (markdownText) => {
    if (!markdownText || typeof markdownText !== 'string') {
      return ''
    }

    try {
      // Parse markdown to HTML using marked only
      const html = marked.parse(markdownText)
      
      // Ensure we get a string
      const htmlString = typeof html === 'string' ? html : String(html)
      
      // Basic security: remove potentially dangerous attributes
      const safeHtml = htmlString
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
        .replace(/javascript\s*:/gi, '') // Remove javascript: URLs
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      
      console.log('Simple parsed HTML:', safeHtml)
      return safeHtml
    } catch (error) {
      console.error('Error parsing markdown (simple):', error)
      return markdownText // Return original text if parsing fails
    }
  }

  /**
   * Basic markdown parser using only string replacements (ultimate fallback)
   * @param {string} markdownText - The markdown text to convert
   * @returns {string} - HTML string
   */
  const parseMarkdownBasic = (markdownText) => {
    if (!markdownText || typeof markdownText !== 'string') {
      return ''
    }

    let html = markdownText
    
    // Basic markdown transformations
    html = html
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="markdown-heading markdown-heading-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="markdown-heading markdown-heading-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="markdown-heading markdown-heading-1">$1</h1>')
      
      // Chunk references (must be before general links)
      .replace(/\[(\d+)\]\(#(CHUNK-[a-f0-9-]+)\)/g, '<a href="#$2" class="markdown-link markdown-chunk-link" data-chunk-id="$2" title="Reference to document chunk $1">[$1]</a>')
      
      // Knowledge/Document references (must be before general links)
      .replace(/\[([^\]]+)\]\((KNOWLEDGE-[a-f0-9-]+)\)/g, '<a href="#$2" class="markdown-link markdown-knowledge-link" data-knowledge-id="$2" title="View document: $1">$1</a>')
      .replace(/\[([^\]]+)\]\(knowledge:\/\/([a-f0-9-]+)\)/g, '<a href="knowledge://$2" class="markdown-link markdown-knowledge-link" data-knowledge-id="$2" title="View document: $1">$1</a>')
      
      // Regular links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="markdown-link" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="markdown-strong">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="markdown-emphasis">$1</em>')
      
      // Highlight
      .replace(/==([^=]+)==/g, '<mark class="markdown-highlight">$1</mark>')
      
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="markdown-inline-code">$1</code>')
      
      // Line breaks
      .replace(/\n/g, '<br>')
      
      // Lists (basic)
      .replace(/^- (.*$)/gim, '<li class="markdown-list-item">$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li class="markdown-list-item">$2</li>')
    
    // Wrap list items in ul/ol
    html = html.replace(/(<li class="markdown-list-item">.*<\/li>)/gs, '<ul class="markdown-unordered-list">$1</ul>')
    return html
  }

  /**
   * Check if text contains markdown syntax
   * @param {string} text - The text to check
   * @returns {boolean} - True if text appears to contain markdown
   */
  const hasMarkdownSyntax = (text) => {
    if (!text || typeof text !== 'string') return false
    
    const markdownPatterns = [
      /^\s*#{1,6}\s+.+$/m, // Headers
      /\*\*.*?\*\*/, // Bold
      /\*.*?\*/, // Italic
      /==.*?==/, // Highlight
      /`.*?`/, // Inline code
      /```[\s\S]*?```/, // Code blocks
      /^\s*[-*+]\s+/m, // Unordered lists
      /^\s*\d+\.\s+/m, // Ordered lists
      /^\s*>\s+/m, // Blockquotes
      /\[.*?\]\(.*?\)/, // Links
      /!\[.*?\]\(.*?\)/, // Images
      /^\s*\|.*\|.*$/m, // Tables
    ]
    
    return markdownPatterns.some(pattern => pattern.test(text))
  }

  /**
   * Get a preview of markdown text (first few words)
   * @param {string} markdownText - The markdown text
   * @param {number} wordLimit - Maximum number of words
   * @returns {string} - Plain text preview
   */
  const getMarkdownPreview = (markdownText, wordLimit = 20) => {
    if (!markdownText) return ''
    
    // Parse markdown and then strip HTML
    const html = parseMarkdown(markdownText)
    const text = html.replace(/<[^>]*>/g, '')
    const words = text.split(/\s+/).filter(word => word.length > 0)
    
    if (words.length <= wordLimit) {
      return text
    }
    
    return words.slice(0, wordLimit).join(' ') + '...'
  }

  /**
   * Extract chunk references from markdown text
   * @param {string} markdownText - The markdown text to analyze
   * @returns {Array} - Array of chunk references {id, text, href}
   */
  const extractChunkReferences = (markdownText) => {
    if (!markdownText || typeof markdownText !== 'string') {
      return []
    }

    const chunkPattern = /\[(\d+)\]\(#(CHUNK-[a-f0-9-]+)\)/g
    const chunks = []
    let match

    while ((match = chunkPattern.exec(markdownText)) !== null) {
      chunks.push({
        id: match[2], // CHUNK-xxx-xxx-xxx
        text: match[1], // Number reference (1, 2, 3, etc.)
        href: `#${match[2]}`, // Full href
        fullMatch: match[0] // Full matched string
      })
    }

    return chunks
  }

  /**
   * Process markdown with enhanced chunk handling
   * @param {string} markdownText - The markdown text to convert
   * @param {Function} onChunkClick - Optional callback for chunk clicks
   * @returns {string} - Processed HTML with chunk handlers
   */
  const parseMarkdownWithChunks = (markdownText, onChunkClick = null) => {
    if (!markdownText || typeof markdownText !== 'string') {
      return ''
    }

    try {
      // First extract chunk references for metadata
      const chunkRefs = extractChunkReferences(markdownText)
      
      // Parse markdown to HTML
      let html = marked.parse(markdownText)
      
      // Ensure we get a string
      const htmlString = typeof html === 'string' ? html : String(html)
      
      // If we have chunk references and a click handler, add click handlers
      if (chunkRefs.length > 0 && onChunkClick && typeof onChunkClick === 'function') {
        // Add click handlers to chunk links
        let processedHtml = htmlString.replace(
          /class="markdown-link markdown-chunk-link" data-chunk-id="([^"]+)"/g,
          (match, chunkId) => {
            return `${match} onclick="window.handleChunkClick && window.handleChunkClick('${chunkId}')"`
          }
        )
        
        // Store the click handler globally (if in browser environment)
        if (typeof window !== 'undefined') {
          window.handleChunkClick = onChunkClick
        }
        
        html = processedHtml
      }
      
      // Use helper function to ensure string output
      const sanitizedHtml = sanitizeToString(html)
      
      return sanitizedHtml
    } catch (error) {
      console.error('Error parsing markdown with chunks:', error)
      return markdownText
    }
  }

  /**
   * Remove chunk and knowledge references from text
   * Removes all markdown-style CHUNK and KNOWLEDGE links
   * @param {string} text - The text to clean
   * @returns {string} - Text without chunk/knowledge references
   */
  const removeChunkAndKnowledgeReferences = (text) => {
    if (!text || typeof text !== 'string') {
      return ''
    }

    let cleanText = text
    
    // Remove markdown-style KNOWLEDGE links: [@filename.pdf](KNOWLEDGE-xxx)
    cleanText = cleanText.replace(/\[@[^\]]+\]\(KNOWLEDGE-[^)]+\)/g, '')
    
    // Remove markdown-style CHUNK links: [1](#CHUNK-xxx)
    cleanText = cleanText.replace(/\[[^\]]+\]\(#CHUNK-[^)]+\)/g, '')
    
    // Remove other CHUNK references: [#CHUNK-xxx]
    cleanText = cleanText.replace(/\[#CHUNK-[^\]]+\]/g, '')
    
    // Remove other KNOWLEDGE references: [#KNOWLEDGE-xxx]
    cleanText = cleanText.replace(/\[#KNOWLEDGE-[^\]]+\]/g, '')
    
    // Clean up extra spaces that might result from removal
    cleanText = cleanText.replace(/\s+/g, ' ').trim()
    
    return cleanText
  }

  return {
    parseMarkdown,
    parseMarkdownSimple,
    parseMarkdownBasic,
    parseMarkdownWithChunks,
    extractChunkReferences,
    hasMarkdownSyntax,
    getMarkdownPreview,
    removeChunkAndKnowledgeReferences
  }
}