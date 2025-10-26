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
  let tableBuffer: string[] = [];
  let inTable = false;

  const closeList = () => {
    if (listType && listItems.length > 0) {
      htmlParts.push(`<${listType}>${listItems.join('')}</${listType}>`);
    }
    listType = null;
    listItems = [];
  };

  const flushTable = () => {
    if (!inTable || tableBuffer.length === 0) {
      tableBuffer = [];
      inTable = false;
      return;
    }

    const rawRows = tableBuffer.map((row) =>
      row
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim()),
    );

    if (rawRows.length === 0) {
      tableBuffer = [];
      inTable = false;
      return;
    }

    const [rawHeader, ...rawBody] = rawRows;
    let alignSpec: string[] | null = null;
    if (
      rawBody.length > 0 &&
      rawBody[0].every((cell) => /^:?-{3,}:?$/.test(cell))
    ) {
      alignSpec = rawBody[0];
      rawBody.shift();
    }

    const headerHtml = rawHeader
      .map((cell, index) => {
        const alignment = alignSpec?.[index] ?? '';
        let alignAttr = '';
        if (alignment.startsWith(':') && alignment.endsWith(':')) {
          alignAttr = ' style="text-align:center"';
        } else if (alignment.startsWith(':')) {
          alignAttr = ' style="text-align:left"';
        } else if (alignment.endsWith(':')) {
          alignAttr = ' style="text-align:right"';
        }
        return `<th${alignAttr}>${formatInline(escapeHtml(cell))}</th>`;
      })
      .join('');

    const bodyHtml = rawBody
      .map((row) =>
        `<tr>${row
          .map((cell) => `<td>${formatInline(escapeHtml(cell))}</td>`)
          .join('')}</tr>`,
      )
      .join('');

    htmlParts.push(`<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`);

    tableBuffer = [];
    inTable = false;
  };

  const flushParagraph = (paragraph: string) => {
    if (!paragraph.trim()) {
      return;
    }
    const escaped = escapeHtml(paragraph);
    htmlParts.push(`<p>${formatInline(escaped)}</p>`);
  };

  let paragraphBuffer: string[] = [];

  lines.forEach((rawLine, index) => {
    const line = rawLine.replace(/\s+$/, '');
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      flushTable();
      flushParagraph(paragraphBuffer.join(' ').trim());
      paragraphBuffer = [];
      return;
    }

    if (/^(-{3,}|_{3,}|\*{3,})$/.test(trimmed)) {
      closeList();
      flushTable();
      flushParagraph(paragraphBuffer.join(' ').trim());
      paragraphBuffer = [];
      htmlParts.push('<hr />');
      return;
    }

    const isSeparatorRow = /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(trimmed);
    const pipeCount = (trimmed.match(/\|/g) ?? []).length;
    const isTableRow = pipeCount >= 2 && trimmed.split('|').some((segment) => segment.trim().length > 0);
    if (isTableRow || (inTable && (isSeparatorRow || trimmed.includes('|')))) {
      if (!inTable) {
        closeList();
        flushParagraph(paragraphBuffer.join(' ').trim());
        paragraphBuffer = [];
        inTable = true;
      }
      tableBuffer.push(trimmed);
      if (index === lines.length - 1) {
        flushTable();
      }
      return;
    }

    if (inTable) {
      flushTable();
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      closeList();
      flushTable();
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
      flushTable();
      flushParagraph(paragraphBuffer.join(' ').trim());
      paragraphBuffer = [];
      const escaped = escapeHtml(blockquoteMatch[1]);
      htmlParts.push(`<blockquote>${formatInline(escaped)}</blockquote>`);
      return;
    }

    const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (unorderedMatch) {
      flushTable();
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
      flushTable();
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
    flushTable();
    paragraphBuffer.push(line);
  });

  closeList();
  flushTable();
  flushParagraph(paragraphBuffer.join(' ').trim());

  return htmlParts.join('');
}

export function RichText({ content }: RichTextProps) {
  const html = useMemo(() => renderMarkdown(content), [content]);

  return <div className="rich-text" dangerouslySetInnerHTML={{ __html: html }} />;
}
