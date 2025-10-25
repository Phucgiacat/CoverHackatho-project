import { useMemo } from 'react';

interface RichTextProps {
  content: string;
}

const INLINE_CODE = /`([^`]+)`/g;
const BOLD = /\*\*(.+?)\*\*/g;
const ITALIC = /\*(?!\s)([^*]+?)\*/g;
const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatInline(text: string): string {
  return text
    .replace(LINK, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(INLINE_CODE, '<code>$1</code>')
    .replace(BOLD, '<strong>$1</strong>')
    .replace(ITALIC, '<em>$1</em>');
}

function renderMarkdown(content: string): string {
  const lines = content.split(/\r?\n/);
  const htmlParts: string[] = [];

  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];

  const closeList = () => {
    if (listType && listItems.length > 0) {
      htmlParts.push(`<${listType}>${listItems.join('')}</${listType}>`);
    }
    listType = null;
    listItems = [];
  };

  const flushParagraph = (paragraph: string) => {
    if (!paragraph.trim()) {
      return;
    }
    const escaped = escapeHtml(paragraph);
    htmlParts.push(`<p>${formatInline(escaped)}</p>`);
  };

  let paragraphBuffer: string[] = [];

  lines.forEach((rawLine) => {
    const line = rawLine.replace(/\s+$/, '');
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      flushParagraph(paragraphBuffer.join(' ').trim());
      paragraphBuffer = [];
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeList();
      flushParagraph(paragraphBuffer.join(' ').trim());
      paragraphBuffer = [];
      const level = Math.min(headingMatch[1].length, 6);
      const escaped = escapeHtml(headingMatch[2]);
      htmlParts.push(`<h${level}>${formatInline(escaped)}</h${level}>`);
      return;
    }

    const blockquoteMatch = trimmed.match(/^>\s+(.*)$/);
    if (blockquoteMatch) {
      closeList();
      flushParagraph(paragraphBuffer.join(' ').trim());
      paragraphBuffer = [];
      const escaped = escapeHtml(blockquoteMatch[1]);
      htmlParts.push(`<blockquote>${formatInline(escaped)}</blockquote>`);
      return;
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (unorderedMatch) {
      flushParagraph(paragraphBuffer.join(' ').trim());
      paragraphBuffer = [];
      if (listType !== 'ul') {
        closeList();
        listType = 'ul';
      }
      const escaped = escapeHtml(unorderedMatch[1]);
      listItems.push(`<li>${formatInline(escaped)}</li>`);
      return;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph(paragraphBuffer.join(' ').trim());
      paragraphBuffer = [];
      if (listType !== 'ol') {
        closeList();
        listType = 'ol';
      }
      const escaped = escapeHtml(orderedMatch[1]);
      listItems.push(`<li>${formatInline(escaped)}</li>`);
      return;
    }

    closeList();
    paragraphBuffer.push(line);
  });

  closeList();
  flushParagraph(paragraphBuffer.join(' ').trim());

  return htmlParts.join('');
}

export function RichText({ content }: RichTextProps) {
  const html = useMemo(() => renderMarkdown(content), [content]);

  return <div className="rich-text" dangerouslySetInnerHTML={{ __html: html }} />;
}
