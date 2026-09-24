import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
} from 'docx';
import { ExamPackage, GeneratedAdminDoc } from '../types';
import { MADRASAH_IDENTITY } from '../data/mockAndPresets';
import { cleanDocumentMarkdown } from '../components/AdminMarkdownRenderer';

export const exportExamToDocx = async (exam: ExamPackage): Promise<void> => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Kop Surat Resmi MA NU 01 Banyuputih (Format Resmi 2 Kolom)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.DOUBLE, size: 14, color: '000000' },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        spacing: { after: 30 },
                        children: [
                          new TextRun({
                            text: MADRASAH_IDENTITY.nama,
                            bold: true,
                            size: 24,
                            font: 'Arial',
                            color: '000000',
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 20 },
                        children: [
                          new TextRun({
                            text: MADRASAH_IDENTITY.alamat,
                            size: 18,
                            font: 'Arial',
                            color: '000000',
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 60 },
                        children: [
                          new TextRun({
                            text: `NPSN: ${MADRASAH_IDENTITY.npsn} | TA: ${exam.config.tahunPelajaran}`,
                            bold: true,
                            size: 18,
                            font: 'Arial',
                            color: '000000',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 30 },
                        children: [
                          new TextRun({
                            text: `NASKAH SOAL ${exam.config.jenisUjian}`,
                            bold: true,
                            size: 20,
                            font: 'Arial',
                            color: '000000',
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 20 },
                        children: [
                          new TextRun({
                            text: 'HARI & TANGGAL: Senin, 21 September 2026',
                            bold: true,
                            size: 16,
                            font: 'Arial',
                            color: '000000',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { before: 160, after: 80 } }),

          // Exam Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 160 },
            children: [
              new TextRun({
                text: `NASKAH SOAL ${exam.config.jenisUjian === 'ASTS' ? 'ASESMEN SUMATIF TENGAH SEMESTER (ASTS)' : exam.config.jenisUjian === 'ASESGA' ? 'ASESMEN SUMATIF AKHIR SEMESTER GASAL (ASESGA)' : 'ASESMEN SUMATIF AKHIR SEKOLAH (ASAS)'}`,
                bold: true,
                size: 22,
                font: 'Arial',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `TAHUN PELAJARAN ${exam.config.tahunPelajaran}`,
                bold: true,
                size: 20,
                font: 'Arial',
              }),
            ],
          }),

          // Metadata Info Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Mata Pelajaran: ', bold: true, size: 18 }),
                          new TextRun({ text: exam.config.mapel, size: 18 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Kelas / Semester: ', bold: true, size: 18 }),
                          new TextRun({ text: `${exam.config.kelas} / Semester ${exam.config.semester}`, size: 18 }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Alokasi Waktu: ', bold: true, size: 18 }),
                          new TextRun({ text: `${exam.config.alokasiWaktuMenit} Menit`, size: 18 }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Guru Pengampu: ', bold: true, size: 18 }),
                          new TextRun({ text: exam.createdBy, size: 18 }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200, after: 200 },
            children: [
              new TextRun({
                text: 'PETUNJUK UMUM: Berdoalah sebelum mengerjakan soal. Bacalah setiap butir soal dengan teliti sebelum menjawab.',
                italics: true,
                size: 16,
              }),
            ],
          }),

          // Questions List
          ...exam.questions.flatMap((q) => {
            const paragraphs: Paragraph[] = [];

            // Question text
            paragraphs.push(
              new Paragraph({
                spacing: { before: 140, after: 80 },
                children: [
                  new TextRun({
                    text: `${q.number}. `,
                    bold: true,
                    size: 20,
                  }),
                  new TextRun({
                    text: q.text,
                    size: 20,
                    font: q.isArabic ? 'Amiri' : 'Arial',
                  }),
                ],
              })
            );

            // Options if Single Choice or Multiple Choice
            if (q.type === 'single_choice' || q.type === 'multiple_choice') {
              if (q.type === 'multiple_choice') {
                paragraphs.push(
                  new Paragraph({
                    spacing: { after: 60 },
                    indent: { left: 360 },
                    children: [
                      new TextRun({
                        text: '*(Pilihlah semua jawaban yang benar / lebih dari satu)*',
                        italics: true,
                        size: 16,
                        color: '555555',
                      }),
                    ],
                  })
                );
              }

              q.options?.forEach((opt) => {
                paragraphs.push(
                  new Paragraph({
                    spacing: { after: 40 },
                    indent: { left: 360 },
                    children: [
                      new TextRun({
                        text: `${opt.key}. `,
                        bold: true,
                        size: 19,
                      }),
                      new TextRun({
                        text: opt.text,
                        size: 19,
                        font: opt.isRtl ? 'Amiri' : 'Arial',
                      }),
                    ],
                  })
                );
              });
            }

            // Ordering Items
            if (q.type === 'ordering' && q.orderingItems) {
              q.orderingItems.forEach((item) => {
                paragraphs.push(
                  new Paragraph({
                    spacing: { after: 40 },
                    indent: { left: 360 },
                    children: [
                      new TextRun({
                        text: `(${item.id}) `,
                        bold: true,
                        size: 18,
                      }),
                      new TextRun({
                        text: item.text,
                        size: 18,
                        font: item.isRtl ? 'Amiri' : 'Arial',
                      }),
                    ],
                  })
                );
              });
            }

            // Matching Items
            if (q.type === 'matching') {
              paragraphs.push(
                new Paragraph({
                  spacing: { after: 40 },
                  indent: { left: 360 },
                  children: [
                    new TextRun({
                      text: 'Premis (Kolom Kiri):',
                      bold: true,
                      size: 18,
                    }),
                  ],
                })
              );
              q.matchingPremises?.forEach((premise) => {
                paragraphs.push(
                  new Paragraph({
                    spacing: { after: 30 },
                    indent: { left: 540 },
                    children: [
                      new TextRun({ text: `${premise.id}. `, bold: true, size: 18 }),
                      new TextRun({ text: premise.text, size: 18 }),
                    ],
                  })
                );
              });
              paragraphs.push(
                new Paragraph({
                  spacing: { before: 60, after: 40 },
                  indent: { left: 360 },
                  children: [
                    new TextRun({
                      text: 'Respons Pilihan (Kolom Kanan):',
                      bold: true,
                      size: 18,
                    }),
                  ],
                })
              );
              q.matchingResponses?.forEach((resp) => {
                paragraphs.push(
                  new Paragraph({
                    spacing: { after: 30 },
                    indent: { left: 540 },
                    children: [
                      new TextRun({ text: `${resp.key}. `, bold: true, size: 18 }),
                      new TextRun({ text: resp.text, size: 18 }),
                    ],
                  })
                );
              });
            }

            // Essay Lines
            if (q.type === 'essay') {
              paragraphs.push(
                new Paragraph({
                  spacing: { before: 80, after: 120 },
                  indent: { left: 360 },
                  children: [
                    new TextRun({
                      text: 'Jawaban: _________________________________________________________________________________\n___________________________________________________________________________________________',
                      color: '888888',
                      size: 16,
                    }),
                  ],
                })
              );
            }

            return paragraphs;
          }),

          // Page Break for Answer Key
          new Paragraph({
            spacing: { before: 300 },
            children: [
              new TextRun({
                text: '═══════════════════════════════════════════════════════════════',
                size: 16,
                color: '888888',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 160 },
            children: [
              new TextRun({
                text: 'KUNCI JAWABAN & PEDOMAN PENSKORAN (DOKUMEN GURU)',
                bold: true,
                size: 22,
                color: '1E4D7B',
              }),
            ],
          }),

          ...exam.questions.map((q) => {
            return new Paragraph({
              spacing: { after: 80 },
              indent: { left: 240 },
              children: [
                new TextRun({
                  text: `Nomor ${q.number} [${q.type}]: `,
                  bold: true,
                  size: 18,
                }),
                new TextRun({
                  text: q.rawRightAnswer || 'Uraian Guru',
                  bold: true,
                  size: 18,
                  color: '2D7A5F',
                }),
                q.explanation
                  ? new TextRun({
                      text: ` — ${q.explanation}`,
                      italics: true,
                      size: 16,
                      color: '555555',
                    })
                  : new TextRun({ text: '' }),
              ],
            });
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${exam.config.jenisUjian}_${exam.config.mapel.replace(/\s+/g, '_')}_Kelas${exam.config.kelas}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Helper: Parse inline markdown (**bold**, *italic*, <br/>) into docx TextRuns
function parseInlineMarkdownRuns(
  text: string,
  defaultSize = 18,
  defaultFont = 'Arial',
  defaultColor?: string,
  forceBold = false
): TextRun[] {
  if (!text) return [];

  // Decode common HTML entities
  let cleanText = text
    .replace(/&bull;/gi, '•')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '—');

  // Convert inline <b> and <strong> to **bold**, <i> and <em> to *italic*
  cleanText = cleanText
    .replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**')
    .replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*')
    .replace(/<u\b[^>]*>([\s\S]*?)<\/u>/gi, '$1')
    .replace(/<\/?(?:div|p|span|section|font|header|footer)\b[^>]*>/gi, '');

  // Split lines by <br> or <br/> or newlines
  const lineParts = cleanText.split(/<br\s*\/?>|\n/gi);
  const runs: TextRun[] = [];

  lineParts.forEach((part, lineIdx) => {
    // Match **bold** or *italic* or plain text
    const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|([^*]+))/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(part)) !== null) {
      if (match[2]) {
        // Bold **...**
        runs.push(
          new TextRun({
            text: match[2],
            bold: true,
            size: defaultSize,
            font: defaultFont,
            color: defaultColor,
            break: lineIdx > 0 && runs.length === 0 ? 1 : undefined,
          })
        );
      } else if (match[3]) {
        // Italic *...*
        runs.push(
          new TextRun({
            text: match[3],
            bold: forceBold,
            italics: true,
            size: defaultSize,
            font: defaultFont,
            color: defaultColor,
            break: lineIdx > 0 && runs.length === 0 ? 1 : undefined,
          })
        );
      } else if (match[4]) {
        // Plain text
        runs.push(
          new TextRun({
            text: match[4],
            bold: forceBold,
            size: defaultSize,
            font: defaultFont,
            color: defaultColor,
            break: lineIdx > 0 && runs.length === 0 ? 1 : undefined,
          })
        );
      }
    }
  });

  return runs.length > 0
    ? runs
    : [new TextRun({ text: cleanText, bold: forceBold, size: defaultSize, font: defaultFont, color: defaultColor })];
}

// Helper: Parse markdown content into structured docx Paragraphs and Tables
function parseMarkdownToDocxElements(markdown: string): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  const lines = markdown.split(/\r?\n/);

  let inTable = false;
  let tableLines: string[] = [];

  const flushTable = () => {
    if (tableLines.length === 0) return;

    // Filter out separator rows like |---|---|
    const validRows = tableLines.filter((l) => !l.includes('---'));
    if (validRows.length === 0) {
      tableLines = [];
      inTable = false;
      return;
    }

    const cellBorder = {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    };

    const docxRows: TableRow[] = [];

    validRows.forEach((rowLine, rIdx) => {
      // Split cells by |
      const rawCols = rowLine.split('|');
      // Trim empty outer split elements
      const cols = rawCols.slice(1, -1).map((c) => c.trim());
      if (cols.length === 0) return;

      const isHeader = rIdx === 0;

      const cells = cols.map((cellText, cIdx) => {
        // First column ('No' or short index) gets smaller width if there are 3+ cols
        let colWidth = Math.floor(100 / cols.length);
        if (cols.length >= 3) {
          if (cIdx === 0 && (cols[0].toLowerCase() === 'no' || cols[0].length <= 3)) {
            colWidth = 8;
          } else {
            colWidth = Math.floor(92 / (cols.length - 1));
          }
        }

        return new TableCell({
          width: { size: colWidth, type: WidthType.PERCENTAGE },
          shading: isHeader ? { fill: 'E2E8F0' } : rIdx % 2 === 1 ? { fill: 'FFFFFF' } : { fill: 'F8FAFC' },
          borders: cellBorder,
          children: [
            new Paragraph({
              alignment: isHeader || (cIdx === 0 && cols[0].toLowerCase() === 'no') ? AlignmentType.CENTER : AlignmentType.LEFT,
              spacing: { before: 60, after: 60 },
              children: parseInlineMarkdownRuns(cellText, isHeader ? 18 : 17, 'Arial', isHeader ? '1E4D7B' : undefined, isHeader),
            }),
          ],
        });
      });

      docxRows.push(
        new TableRow({
          tableHeader: isHeader,
          children: cells,
        })
      );
    });

    if (docxRows.length > 0) {
      elements.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: docxRows,
        })
      );
      // Spacing after table
      elements.push(new Paragraph({ spacing: { after: 120 } }));
    }

    tableLines = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check if line is part of a markdown table
    if (trimmed.startsWith('|')) {
      inTable = true;
      tableLines.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Skip empty lines
    if (!trimmed) {
      elements.push(new Paragraph({ spacing: { after: 40 } }));
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      elements.push(
        new Paragraph({
          spacing: { before: 240, after: 100 },
          children: parseInlineMarkdownRuns(trimmed.slice(2), 22, 'Arial', '1E4D7B', true),
        })
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        new Paragraph({
          spacing: { before: 180, after: 80 },
          children: parseInlineMarkdownRuns(trimmed.slice(3), 20, 'Arial', '2D7A5F', true),
        })
      );
    } else if (trimmed.startsWith('### ')) {
      elements.push(
        new Paragraph({
          spacing: { before: 140, after: 60 },
          children: parseInlineMarkdownRuns(trimmed.slice(4), 18, 'Arial', '1E4D7B', true),
        })
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      // Bullet item
      elements.push(
        new Paragraph({
          indent: { left: 360 },
          spacing: { after: 40 },
          children: [
            new TextRun({ text: '•  ', bold: true, color: '2D7A5F', size: 18 }),
            ...parseInlineMarkdownRuns(trimmed.slice(2), 18),
          ],
        })
      );
    } else if (/^\d+\.\s+/.test(trimmed)) {
      // Numbered list item
      const numMatch = trimmed.match(/^(\d+\.)\s+(.*)/);
      if (numMatch) {
        elements.push(
          new Paragraph({
            indent: { left: 360 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: `${numMatch[1]} `, bold: true, size: 18 }),
              ...parseInlineMarkdownRuns(numMatch[2], 18),
            ],
          })
        );
      }
    } else if (trimmed === '---' || trimmed === '***') {
      // Divider
      elements.push(
        new Paragraph({
          spacing: { before: 120, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'E2E8F0' } },
        })
      );
    } else {
      // Regular paragraph
      elements.push(
        new Paragraph({
          spacing: { after: 80 },
          children: parseInlineMarkdownRuns(trimmed, 18),
        })
      );
    }
  }

  if (inTable) {
    flushTable();
  }

  return elements;
}

export const exportAdminDocToDocx = async (docData: GeneratedAdminDoc): Promise<void> => {
  const config = docData.config;
  const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'auto' };
  const borderlessCell = {
    top: NO_BORDER,
    bottom: NO_BORDER,
    left: NO_BORDER,
    right: NO_BORDER,
  };

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Kop Surat Resmi MA NU 01 Banyuputih (Format 2 Kolom)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.DOUBLE, size: 14, color: '000000' },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        spacing: { after: 30 },
                        children: [
                          new TextRun({
                            text: MADRASAH_IDENTITY.nama,
                            bold: true,
                            size: 24,
                            font: 'Arial',
                            color: '000000',
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 20 },
                        children: [
                          new TextRun({
                            text: MADRASAH_IDENTITY.alamat,
                            size: 18,
                            font: 'Arial',
                            color: '000000',
                          }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 60 },
                        children: [
                          new TextRun({
                            text: `NPSN: ${MADRASAH_IDENTITY.npsn} | TA: ${config.tahunPelajaran}`,
                            bold: true,
                            size: 18,
                            font: 'Arial',
                            color: '000000',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 30 },
                        children: [
                          new TextRun({
                            text: docData.type === 'rpp'
                              ? 'RENCANA PELAKSANAAN PEMBELAJARAN (RPP)'
                              : docData.type === 'cp'
                              ? 'ANALISIS CAPAIAN PEMBELAJARAN (CP)'
                              : docData.type === 'atp'
                              ? 'ALUR TUJUAN PEMBELAJARAN (ATP)'
                              : 'PERANGKAT ADMINISTRASI KBM',
                            bold: true,
                            size: 20,
                            font: 'Arial',
                            color: '000000',
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 20 },
                        children: [
                          new TextRun({
                            text: docData.type === 'rpp'
                              ? `KELAS ${config.kelas} (FASE ${config.fase}) | SEMESTER ${config.semester}`
                              : `SEMESTER ${config.semester} / KELAS ${config.kelas}`,
                            bold: true,
                            size: 16,
                            font: 'Arial',
                            color: '000000',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { before: 160, after: 80 } }),

          // Document Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 180 },
            children: [
              new TextRun({
                text: docData.title.toUpperCase(),
                bold: true,
                size: 22,
                font: 'Arial',
                color: '1E4D7B',
              }),
            ],
          }),

          // Metadata Info Table (Structured 2-Column Box)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                      left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                      right: { style: BorderStyle.NONE },
                    },
                    shading: { fill: 'F8FAFC' },
                    children: [
                      new Paragraph({
                        spacing: { before: 40, after: 40 },
                        children: [
                          new TextRun({ text: 'Mata Pelajaran: ', bold: true, size: 18 }),
                          new TextRun({ text: docData.config.mapel, size: 18 }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [
                          new TextRun({ text: 'Fase / Kelas: ', bold: true, size: 18 }),
                          new TextRun({ text: `Fase ${docData.config.fase} / Kelas ${docData.config.kelas}`, size: 18 }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [
                          new TextRun({ text: 'Topik / Materi: ', bold: true, size: 18 }),
                          new TextRun({ text: docData.config.topikMateri, size: 18 }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
                    },
                    shading: { fill: 'F8FAFC' },
                    children: [
                      new Paragraph({
                        spacing: { before: 40, after: 40 },
                        children: [
                          new TextRun({ text: 'Tahun Pelajaran: ', bold: true, size: 18 }),
                          new TextRun({ text: `${docData.config.tahunPelajaran} (Semester ${docData.config.semester})`, size: 18 }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [
                          new TextRun({ text: 'Alokasi Waktu: ', bold: true, size: 18 }),
                          new TextRun({ text: docData.config.alokasiWaktu, size: 18 }),
                        ],
                      }),
                      new Paragraph({
                        spacing: { after: 40 },
                        children: [
                          new TextRun({ text: 'Guru Pengampu: ', bold: true, size: 18 }),
                          new TextRun({ text: `${docData.config.guruPengampu} (NIP: ${docData.config.nipGuru})`, size: 18 }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { before: 160, after: 80 } }),

          // Document Body with parsed tables, headings, and lists
          ...parseMarkdownToDocxElements(cleanDocumentMarkdown(docData.contentMarkdown)),

          // Signature Block (2-Column Borderless Table: Headmaster Left, Teacher Right)
          new Paragraph({ spacing: { before: 240, after: 80 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: borderlessCell,
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Mengetahui,', size: 18 })],
                      }),
                      new Paragraph({
                        spacing: { after: 550 },
                        children: [new TextRun({ text: 'Kepala MA NU 01 Banyuputih', bold: true, size: 18 })],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: docData.config.kepalaMadrasah,
                            bold: true,
                            underline: {},
                            size: 18,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: `NIP. ${docData.config.nipKepala}`, size: 16 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: borderlessCell,
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Banyuputih, 21 September 2026', size: 18 })],
                      }),
                      new Paragraph({
                        spacing: { after: 550 },
                        children: [new TextRun({ text: 'Guru Pengampu Mata Pelajaran', bold: true, size: 18 })],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: docData.config.guruPengampu,
                            bold: true,
                            underline: {},
                            size: 18,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: `NIP. ${docData.config.nipGuru}`, size: 16 })],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${docData.type}_${docData.config.mapel.replace(/\s+/g, '_')}_Kelas${docData.config.kelas}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
