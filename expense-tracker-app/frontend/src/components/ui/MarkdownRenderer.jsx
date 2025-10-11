import React from 'react';

/**
 * Enhanced Markdown Renderer Component
 * Properly handles all markdown formatting with better parsing
 */
const MarkdownRenderer = ({ content, className = '' }) => {
  if (!content) return null;

  const parseMarkdown = (text) => {
    // Split into lines for better processing
    const lines = text.split('\n');
    const result = [];
    let inCodeBlock = false;
    let inList = false;
    let listItems = [];
    let codeContent = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Handle code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          result.push(`<pre class="bg-slate-100 border border-slate-200 p-4 rounded-lg text-sm font-mono overflow-x-auto my-4 shadow-sm"><code class="text-slate-800">${codeContent.join('\n')}</code></pre>`);
          codeContent = [];
          inCodeBlock = false;
        } else {
          // Start code block
          if (inList) {
            result.push(`<ul class="space-y-2 my-4 pl-2">${listItems.join('')}</ul>`);
            listItems = [];
            inList = false;
          }
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // Handle lists
      if (line.match(/^[•\-]\s+/) || line.match(/^\d+\.\s+/)) {
        if (!inList) inList = true;
        
        const content = line.replace(/^[•\-]\s+/, '').replace(/^\d+\.\s+/, '');
        const formattedContent = formatInlineMarkdown(content);
        listItems.push(`<li class="flex items-start gap-3 mb-2"><span class="text-primary font-bold mt-1 flex-shrink-0">•</span><span class="flex-1">${formattedContent}</span></li>`);
        continue;
      } else if (inList) {
        // End list
        result.push(`<ul class="space-y-2 my-4 pl-2">${listItems.join('')}</ul>`);
        listItems = [];
        inList = false;
      }

      // Handle headers
      if (line.startsWith('#### ')) {
        result.push(`<h4 class="text-base font-semibold text-slate-700 mt-4 mb-2">${formatInlineMarkdown(line.substring(5))}</h4>`);
      } else if (line.startsWith('### ')) {
        result.push(`<h3 class="text-lg font-semibold text-slate-800 mt-5 mb-3">${formatInlineMarkdown(line.substring(4))}</h3>`);
      } else if (line.startsWith('## ')) {
        result.push(`<h2 class="text-xl font-bold text-slate-800 mt-6 mb-3 border-b border-slate-200 pb-2">${formatInlineMarkdown(line.substring(3))}</h2>`);
      } else if (line.startsWith('# ')) {
        result.push(`<h1 class="text-2xl font-bold text-slate-800 mt-6 mb-4 border-b-2 border-primary pb-2">${formatInlineMarkdown(line.substring(2))}</h1>`);
      } else if (line.trim() === '') {
        // Empty line - paragraph break
        result.push('<div class="h-2"></div>');
      } else {
        // Regular paragraph
        result.push(`<p class="mb-3 leading-relaxed text-slate-800">${formatInlineMarkdown(line)}</p>`);
      }
    }

    // Close any open list
    if (inList) {
      result.push(`<ul class="space-y-2 my-4 pl-2">${listItems.join('')}</ul>`);
    }

    return result.join('');
  };

  const formatInlineMarkdown = (text) => {
    let formatted = text;

    // Bold
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    
    // Italic
    formatted = formatted.replace(/\*(.+?)\*/g, '<em class="italic text-slate-700">$1</em>');
    
    // Inline code
    formatted = formatted.replace(/`(.+?)`/g, '<code class="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-sm font-mono text-slate-800">$1</code>');
    
    // Links
    formatted = formatted.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary hover:text-primary-600 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Highlight
    formatted = formatted.replace(/==(.+?)==/g, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');

    return formatted;
  };

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
};

export default MarkdownRenderer;
