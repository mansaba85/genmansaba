import React from 'react';

interface AdminMarkdownRendererProps {
  content: string;
}

/**
 * Decodes HTML entities commonly produced by LLMs or web scrapers
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&bull;/gi, '•')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '—')
    .replace(/&hellip;/gi, '…')
    .replace(/&times;/gi, '×')
    .replace(/&divide;/gi, '÷');
}

/**
 * Sanitizes markdown by stripping stray HTML tags (div, span, style, p, etc.)
 * while preserving markdown formatting and converting bold/italic HTML tags to markdown.
 */
export function sanitizeHtmlTags(text: string): string {
  if (!text) return '';
  let str = text;

  // 1. Decode entities
  str = decodeHtmlEntities(str);

  // 2. Remove script and style blocks entirely
  str = str.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  str = str.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // 3. Convert bold and italic HTML tags to standard Markdown
  str = str.replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**');
  str = str.replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');
  str = str.replace(/<u\b[^>]*>([\s\S]*?)<\/u>/gi, '$1');

  // 4. Handle line breaks: outside tables convert to newline, inside tables convert to <br/>
  const lines = str.split(/\r?\n/);
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      // Inside table line: normalize break tags to <br/>
      return line
        .replace(/<\/?br\s*\/?>/gi, '<br/>')
        .replace(/<\/?(?:div|p|span|section|header|footer|font|center)\b[^>]*>/gi, '');
    } else {
      // Outside table: convert <br> to newline and remove block wrapper tags
      return line
        .replace(/<\/?br\s*\/?>/gi, '\n')
        .replace(/<\/?(?:div|p|span|section|header|footer|font|center)\b[^>]*>/gi, '');
    }
  });
  str = processedLines.join('\n');

  // 5. Remove any leftover HTML tags (except <br/> inside table cells if any)
  str = str.replace(/<\/?(?:html|body|head|meta|link|div|p|span|section|header|footer|font|center)\b[^>]*>/gi, '');

  // 6. Clean multiple consecutive empty lines
  str = str.replace(/\n{3,}/g, '\n\n');

  return str;
}

// Helper to parse inline markdown: **bold**, *italic*, and <br/> line breaks
export function renderInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  // Sanitize any remaining raw tags and decode entities
  let cleanText = decodeHtmlEntities(text);
  cleanText = cleanText.replace(/<\/?(?:div|p|span|section|font|b|strong|i|em|u)\b[^>]*>/gi, '');

  // Split by line breaks if present (<br/> or <br> or \n)
  const lineParts = cleanText.split(/<br\s*\/?>|\n/gi);

  const finalNodes: React.ReactNode[] = [];

  lineParts.forEach((linePart, lineIdx) => {
    if (lineIdx > 0) {
      finalNodes.push(<br key={`br-${lineIdx}`} />);
    }

    const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|([^*]+))/g;
    let match: RegExpExecArray | null;
    let nodeIdx = 0;

    while ((match = regex.exec(linePart)) !== null) {
      if (match[2]) {
        finalNodes.push(
          <strong key={`${lineIdx}-${nodeIdx++}`} className="font-semibold text-slate-900">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        finalNodes.push(
          <em key={`${lineIdx}-${nodeIdx++}`} className="italic text-slate-700">
            {match[3]}
          </em>
        );
      } else if (match[4]) {
        finalNodes.push(<span key={`${lineIdx}-${nodeIdx++}`}>{match[4]}</span>);
      }
    }
  });

  return finalNodes.length > 0 ? finalNodes : [<span key={0}>{text}</span>];
}

interface TableBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

interface HeadingBlock {
  type: 'h1' | 'h2' | 'h3';
  text: string;
}

interface ListBlock {
  type: 'bullet' | 'number';
  prefix: string;
  text: string;
}

interface DividerBlock {
  type: 'hr';
}

interface ParagraphBlock {
  type: 'p';
  text: string;
}

type ContentBlock =
  | TableBlock
  | HeadingBlock
  | ListBlock
  | DividerBlock
  | ParagraphBlock;

export function stripDuplicatePengesahan(text: string): string {
  if (!text) return '';
  let cleaned = text;

  // 1. Remove markdown section starting with headings like LEMBAR PENGESAHAN, PENGESAHAN, TANDA TANGAN
  cleaned = cleaned.replace(
    /(?:---\s*\n+)?(?:#{1,4}\s*)?(?:[IVXLCDM\d\.\sA-Fa-f]*\s*)?(?:LEMBAR\s+)?(?:PENGESAHAN|TANDA\s*TANGAN|PENGESAHAN\s+DOKUMEN)[\s\S]*$/i,
    ''
  );

  // 2. Remove sections or blocks starting with "Disahkan oleh:", "Disetujui oleh:", "Mengetahui,", "Menyetujui:" etc.
  cleaned = cleaned.replace(
    /(?:---\s*\n+)?(?:#{1,4}\s*)?(?:\*{1,2}|_{1,2})?(?:Disahkan\s+(?:oleh)?|Disetujui\s+(?:oleh)?|Menyetujui|Mengetahui|Mengetahui\s*,|Tanda\s+Tangan|Tanda\s+Tangan\s*:)(?:\*{1,2}|_{1,2})?[\s\S]*$/i,
    ''
  );

  // 3. Remove date/location footer followed by signatures (e.g., "Banyuputih, ..." or "Batang, ...")
  cleaned = cleaned.replace(
    /(?:---\s*\n+)?(?:Batang|Banyuputih)[^\n]*(?:\n+[^\n]*){0,4}\n+(?:Disahkan|Disetujui|Mengetahui|Kepala\s+MA|Kepala\s+Madrasah|Guru\s+Pengampu|Guru\s+Mata\s+Pelajaran)[\s\S]*$/i,
    ''
  );

  // 4. Remove signature blocks containing "(Tanda Tangan)" or "(ttd)"
  cleaned = cleaned.replace(
    /(?:---\s*\n+)?(?:\*{1,2}|_{1,2})?(?:Kepala\s+MA|Kepala\s+Madrasah|Guru\s+Pengampu|Guru\s+Mata\s+Pelajaran)(?:\*{1,2}|_{1,2})?[\s\S]*?(?:\(Tanda\s*Tangan\)|\[Tanda\s*Tangan\]|\(ttd\)|\[ttd\])[\s\S]*$/i,
    ''
  );

  // 5. Remove HTML or Markdown signature table at the end
  cleaned = cleaned.replace(
    /(?:---\s*\n+)?(?:\|[^\n]*(?:Mengetahui|Disahkan|Kepala\s+MA|Guru\s+Pengampu|Tanda\s+Tangan)[^\n]*\|\n*)+[\s\S]*$/i,
    ''
  );

  // 6. Remove html-based signature footer div at end if present
  cleaned = cleaned.replace(
    /<div[^>]*>\s*<div[^>]*>(?:Mengetahui|Disahkan|Kepala|Guru)[^<]*<\/div>[\s\S]*?<\/div>\s*<\/div>\s*$/i,
    ''
  );

  // 7. Remove trailing divider lines and trailing whitespace
  cleaned = cleaned.replace(/(?:\r?\n\s*---\s*)+\s*$/, '').trim();

  return cleaned;
}

export function stripDuplicateIdentitas(text: string): string {
  if (!text) return '';
  let cleaned = text;

  // 1. Remove markdown section starting with ### IDENTITAS, ### I. IDENTITAS DOKUMEN, ## A. IDENTITAS MODUL, etc.
  const pattern1 = /(?:---\s*\n+)?(?:#{1,4})\s*(?:[IVXLCDM\d\.\sA-Fa-f]*\s*)?IDENTITAS(?:\s+(?:DOKUMEN|MODUL|MATA\s+PELAJARAN|RPP|PROGRAM|PEMBELAJARAN))?[^\n]*\n+(?:(?:[-*•]\s+[^:\n]+:[^\n]*|\s*)\n+)*(?:---\s*\n+)?/gi;
  cleaned = cleaned.replace(pattern1, '').trim();

  // 2. Match if identity section spans until the next analytical/instructional section
  const pattern2 = /(?:---\s*\n+)?(?:#{1,4})\s*(?:[IVXLCDM\d\.\sA-Fa-f]*\s*)?IDENTITAS(?:\s+(?:DOKUMEN|MODUL|MATA\s+PELAJARAN|RPP|PROGRAM|PEMBELAJARAN))?[\s\S]*?(?=(?:---\s*\n+)?(?:#{1,4})\s*(?:[IVXLCDM\d\.\sA-Fa-f]*\s*)?(?:ANALISIS|CAPAIAN|DESAIN|KOMPONEN|IDENTIFIKASI|LANGKAH|TUJUAN|DISTRIBUSI|PROGRAM|TABEL|A\.|I\.))/i;
  cleaned = cleaned.replace(pattern2, '').trim();

  // 3. Remove standalone bullet lists of school/teacher identity right at top of document
  const pattern3 = /^(?:(?:[-*•]\s+\*\*(?:Nama\s+Sekolah|Satuan\s+Pendidikan|Mata\s+Pelajaran|Fase|Kelas|Tahun\s+Pelajaran|Guru\s+Pengampu|Kepala\s+Madrasah)[^*]*\*\*:[^\n]*|\s*)\n+)+(?:---\s*\n+)?/gi;
  cleaned = cleaned.replace(pattern3, '').trim();

  // 4. Remove leading horizontal rules if left right at the top
  cleaned = cleaned.replace(/^---\s*\n+/g, '').trim();

  return cleaned;
}

/**
 * Master cleaning pipeline for Admin Documents
 */
export function cleanDocumentMarkdown(text: string): string {
  if (!text) return '';
  // 1. Sanitize raw HTML tags and convert them to clean Markdown
  const sanitized = sanitizeHtmlTags(text);
  // 2. Strip duplicate header identity if generated by model
  const withoutIdentitas = stripDuplicateIdentitas(sanitized);
  // 3. Strip duplicate signature footer if generated by model
  const withoutPengesahan = stripDuplicatePengesahan(withoutIdentitas);
  return withoutPengesahan.trim();
}

export const AdminMarkdownRenderer: React.FC<AdminMarkdownRendererProps> = ({ content }) => {
  const blocks: ContentBlock[] = [];
  const cleanedContent = cleanDocumentMarkdown(content);
  const lines = cleanedContent.split(/\r?\n/);

  let inTable = false;
  let currentTableRows: string[][] = [];

  const flushTable = () => {
    if (currentTableRows.length > 0) {
      const validRows = currentTableRows.filter(
        (row) => !row.some((cell) => cell.includes('---') || cell.includes('===') || cell.match(/^:?-+:?$/))
      );
      if (validRows.length > 0) {
        const headers = validRows[0];
        const rows = validRows.slice(1);
        blocks.push({
          type: 'table',
          headers,
          rows,
        });
      }
      currentTableRows = [];
    }
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check if line is a markdown table row
    if (trimmed.startsWith('|')) {
      inTable = true;
      const rawCols = trimmed.split('|');
      const cells = rawCols.slice(1, -1).map((c) => c.trim());
      if (cells.length > 0) {
        currentTableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (!trimmed) {
      continue;
    }

    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', text: trimmed.slice(2) });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.slice(3) });
    } else if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.slice(4) });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      blocks.push({ type: 'bullet', prefix: '•', text: trimmed.slice(2) });
    } else if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+\.)\s+(.*)/);
      if (match) {
        blocks.push({ type: 'number', prefix: match[1], text: match[2] });
      }
    } else if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      blocks.push({ type: 'hr' });
    } else {
      blocks.push({ type: 'p', text: trimmed });
    }
  }

  if (inTable) {
    flushTable();
  }

  return (
    <div className="space-y-3 text-xs leading-relaxed text-slate-800">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h1':
            return (
              <h2
                key={idx}
                className="font-heading text-base font-bold text-[#1e4d7b] border-b-2 border-[#1e4d7b]/20 pb-1.5 mt-5 mb-2 tracking-tight"
              >
                {renderInlineMarkdown(block.text)}
              </h2>
            );
          case 'h2':
            return (
              <h3
                key={idx}
                className="font-heading text-sm font-bold text-[#2d7a5f] mt-4 mb-2"
              >
                {renderInlineMarkdown(block.text)}
              </h3>
            );
          case 'h3':
            return (
              <h4
                key={idx}
                className="font-semibold text-xs text-slate-800 mt-3 mb-1 uppercase tracking-wider text-[#1e4d7b]"
              >
                {renderInlineMarkdown(block.text)}
              </h4>
            );
          case 'bullet':
            return (
              <div key={idx} className="flex items-start space-x-2 pl-3 my-1">
                <span className="text-[#2d7a5f] font-bold select-none">•</span>
                <span className="text-slate-700 flex-1 leading-normal">
                  {renderInlineMarkdown(block.text)}
                </span>
              </div>
            );
          case 'number':
            return (
              <div key={idx} className="flex items-start space-x-2 pl-3 my-1">
                <span className="font-semibold text-[#1e4d7b] min-w-[20px] select-none">
                  {block.prefix}
                </span>
                <span className="text-slate-700 flex-1 leading-normal">
                  {renderInlineMarkdown(block.text)}
                </span>
              </div>
            );
          case 'hr':
            return <hr key={idx} className="my-3 border-t border-slate-200" />;
          case 'table': {
            const hasNoCol =
              block.headers.length > 0 &&
              (block.headers[0].toLowerCase() === 'no' || block.headers[0] === '#');

            return (
              <div
                key={idx}
                className="overflow-x-auto my-3 border border-slate-300 rounded-lg shadow-2xs print:border-slate-400 print:shadow-none print:overflow-visible"
              >
                <table className="w-full text-left border-collapse text-[11px] print:text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-900 font-semibold print:bg-slate-200">
                      {block.headers.map((hdr, hIdx) => {
                        const isFirstNo = hIdx === 0 && hasNoCol;
                        return (
                          <th
                            key={hIdx}
                            className={`p-2 sm:p-2.5 border-r border-slate-300 last:border-r-0 ${
                              isFirstNo ? 'w-10 text-center' : ''
                            }`}
                          >
                            {renderInlineMarkdown(hdr)}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={`border-b border-slate-200 last:border-b-0 ${
                          rIdx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                        } print:border-slate-300`}
                      >
                        {row.map((cell, cIdx) => {
                          const isFirstNo = cIdx === 0 && hasNoCol;
                          return (
                            <td
                              key={cIdx}
                              className={`p-2 sm:p-2.5 border-r border-slate-200 last:border-r-0 align-top ${
                                isFirstNo ? 'text-center font-medium text-slate-600' : 'text-slate-800'
                              }`}
                            >
                              {renderInlineMarkdown(cell)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          case 'p':
          default:
            return (
              <p key={idx} className="text-slate-700 leading-relaxed my-1">
                {renderInlineMarkdown(block.text)}
              </p>
            );
        }
      })}
    </div>
  );
};
