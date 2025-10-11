import React from 'react';

/**
 * Simple Markdown Renderer Component
 * Supports basic markdown formatting without external dependencies
 */
const MarkdownRenderer = ({ content, className = '' }) => {
  if (!content) return null;

  // Enhanced markdown parsing function
  const parseMarkdown = (text) => {
    let html = text;
    
    // Headers with better styling
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-base font-semibold text-slate-700 mt-3 mb-2">$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-slate-800 mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-800 mt-6 mb-3 border-b border-slate-200 pb-1">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-slate-800 mt-6 mb-4 border-b-2 border-primary pb-2">$1</h1>');
    
    // Enhanced text formatting
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-700">$1</em>');
    
    // Code blocks with syntax highlighting background
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-100 border border-slate-200 p-4 rounded-lg text-sm font-mono overflow-x-auto my-3 shadow-sm"><code class="text-slate-800">$1</code></pre>');
    
    // Inline code with better styling
    html = html.replace(/`(.*?)`/g, '<code class="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-sm font-mono text-slate-800">$1</code>');
    
    // Enhanced lists with better spacing
    html = html.replace(/^\• (.*$)/gim, '<li class="flex items-start gap-2 mb-1"><span class="text-primary font-bold mt-0.5">•</span><span>$1</span></li>');
    html = html.replace(/^- (.*$)/gim, '<li class="flex items-start gap-2 mb-1"><span class="text-primary font-bold mt-0.5">•</span><span>$1</span></li>');
    
    // Numbered lists
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li class="flex items-start gap-2 mb-1"><span class="text-primary font-bold mt-0.5 min-w-[1.5rem]">$1.</span><span>$2</span></li>');
    
    // Wrap consecutive list items in ul/ol tags
    html = html.replace(/(<li class="flex items-start gap-2 mb-1">.*?<\/li>\s*)+/g, '<ul class="space-y-1 my-3 pl-2">$&</ul>');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary bg-primary/5 pl-4 py-2 my-3 italic text-slate-700">$1</blockquote>');
    
    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr class="border-slate-200 my-4" />');
    html = html.replace(/^===$/gim, '<hr class="border-slate-300 border-2 my-4" />');
    
    // Tables (basic support)
    html = html.replace(/\|(.*?)\|/g, '<td class="border border-slate-200 px-3 py-2">$1</td>');
    
    // Links (if any)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:text-primary-600 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Highlight important text with background
    html = html.replace(/==(.*?)==/g, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    
    // Line breaks and paragraphs with better spacing
    html = html.replace(/\n\n/g, '</p><p class="mb-3 leading-relaxed">');
    html = '<p class="mb-3 leading-relaxed">' + html + '</p>';
    
    // Single line breaks
    html = html.replace(/\n/g, '<br />');
    
    // Clean up empty paragraphs
    html = html.replace(/<p class="mb-3 leading-relaxed"><\/p>/g, '');
    html = html.replace(/<p class="mb-3 leading-relaxed">\s*<\/p>/g, '');
    
    return html;
  };

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
};

export default MarkdownRenderer;
