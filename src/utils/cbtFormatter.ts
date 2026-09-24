import { ExamFormConfig, QuestionItem } from '../types';

export function normalizeKelas(kelas: string): string {
  const k = (kelas || '').trim().toUpperCase();
  if (k === 'X' || k === '10' || k.includes('10')) return '10';
  if (k === 'XI' || k === '11' || k.includes('11')) return '11';
  if (k === 'XII' || k === '12' || k.includes('12')) return '12';
  return k.replace(/[^a-zA-Z0-9]/g, '') || '10';
}

export function sanitizeIdentifier(str: string): string {
  return (str || '')
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_');
}

/**
 * Mengubah rumus LaTeX/KaTeX menjadi URL gambar equation yang didukung penuh oleh CKEditor CBT
 * Menggunakan CodeCogs Math Rendering API (standar industri untuk CKEditor CBT madrasah/sekolah)
 */
export function latexToImageUrl(latex: string, format: 'png' | 'svg' = 'png'): string {
  const clean = latex.trim().replace(/\s+/g, ' ');
  if (format === 'svg') {
    return `https://latex.codecogs.com/svg.image?${encodeURIComponent(clean)}`;
  }
  // PNG 150 DPI latar putih tajam dan terbaca jelas di layar HP/komputer siswa
  return `https://latex.codecogs.com/png.image?\\dpi{150}\\bg{white}${encodeURIComponent(clean)}`;
}

/**
 * Mengganti semua sintaks KaTeX ($...$ atau $$...$$) dalam teks menjadi tag <img>
 * sehingga saat di-paste atau diimpor ke CKEditor di CBT, rumus otomatis tampil sebagai GAMBAR.
 */
export function replaceLatexWithImgTags(text: string, format: 'png' | 'svg' = 'png'): string {
  if (!text) return '';

  // 1. Ganti block math $$...$$
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, formula) => {
    const url = latexToImageUrl(formula, format);
    const escapedAlt = formula.replace(/"/g, '&quot;');
    return `<div style="text-align:center;margin:8px 0;"><img src="${url}" alt="${escapedAlt}" class="latex-equation" style="vertical-align:middle;display:inline-block;max-width:100%;" /></div>`;
  });

  // 2. Ganti inline math $...$
  result = result.replace(/\$([^$\n]+?)\$/g, (_, formula) => {
    const url = latexToImageUrl(formula, format);
    const escapedAlt = formula.replace(/"/g, '&quot;');
    return `<img src="${url}" alt="${escapedAlt}" class="latex-equation-inline" style="vertical-align:middle;margin:0 3px;" />`;
  });

  return result;
}

/**
 * Mengubah daftar soal & konfigurasi ujian ke dalam format teks CBT standar madrasah
 * Sesuai spesifikasi template import CBT (MODULE:=, TOPIC:=, Q:n), A:), RIGHT:)
 * Opsi `equationAsImage`: jika true, otomatis mengubah rumus matematika $...$ menjadi tag <img>
 */
export function formatExamToCbtText(
  config: { jenisUjian: string; mapel: string; kelas: string },
  questions: QuestionItem[],
  options?: { equationAsImage?: boolean; imageFormat?: 'png' | 'svg' }
): string {
  const normKelas = normalizeKelas(config.kelas);
  const cleanMapel = sanitizeIdentifier(config.mapel) || 'Mapel';
  const cleanJenis = sanitizeIdentifier(config.jenisUjian) || 'ASTS';
  const convertEq = options?.equationAsImage ?? false;
  const imgFormat = options?.imageFormat || 'png';

  const transformText = (t: string) => (convertEq ? replaceLatexWithImgTags(t, imgFormat) : t);

  const lines: string[] = [];
  lines.push(`MODULE:=${cleanJenis}_${normKelas}`);
  lines.push(`TOPIC:=${cleanMapel}_${normKelas}`);
  lines.push('');

  questions.forEach((q, idx) => {
    const qNum = q.number || idx + 1;
    const qText = transformText(q.text.trim());

    switch (q.type) {
      case 'single_choice': {
        lines.push(`Q:${qNum})${qText}`);
        if (q.options && q.options.length > 0) {
          q.options.forEach((opt) => {
            lines.push(`${opt.key}:)${transformText(opt.text.trim())}`);
          });
        }
        const rightKey = q.rawRightAnswer?.replace(/^RIGHT:\s*/i, '').trim() || 'A';
        lines.push(`RIGHT:${rightKey}`);
        lines.push('');
        break;
      }

      case 'multiple_choice': {
        lines.push(`Q:${qNum})${qText}`);
        if (q.options && q.options.length > 0) {
          q.options.forEach((opt) => {
            lines.push(`${opt.key}:)${transformText(opt.text.trim())}`);
          });
        }
        const rightKeys = q.rawRightAnswer?.replace(/^RIGHT:\s*/i, '').trim() || 'A,B';
        lines.push(`RIGHT:${rightKeys}`);
        lines.push('');
        break;
      }

      case 'short_answer': {
        let questionText = qText;
        if (!questionText.toLowerCase().includes('kotak yang disediakan')) {
          questionText += '\n( jawablah dengan mengetikkan huruf kapital pada kotak yang disediakan )';
        }
        lines.push(`Q:${qNum})${questionText}`);
        const ans = transformText((q.options?.[0]?.text || 'JAWABAN').trim().toUpperCase());
        lines.push(`A:)${ans}`);
        lines.push('RIGHT:A');
        lines.push('');
        break;
      }

      case 'ordering': {
        lines.push(`Q:${qNum})${qText}`);
        if (q.orderingItems && q.orderingItems.length > 0) {
          const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
          q.orderingItems.forEach((item, i) => {
            const letter = letters[i] || String.fromCharCode(65 + i);
            lines.push(`${letter}:)${transformText(item.text.trim())}`);
          });
        } else if (q.options && q.options.length > 0) {
          q.options.forEach((opt) => {
            lines.push(`${opt.key}:)${transformText(opt.text.trim())}`);
          });
        }
        lines.push('RIGHT:');
        lines.push('');
        break;
      }

      case 'matching': {
        lines.push(`Q:${qNum})${qText}`);
        if (q.matchingResponses && q.matchingResponses.length > 0) {
          q.matchingResponses.forEach((resp, rIdx) => {
            lines.push(`${rIdx + 1}.\t${transformText(resp.text.trim())}`);
          });
        }
        if (q.matchingPremises && q.matchingPremises.length > 0) {
          const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
          q.matchingPremises.forEach((premise, pIdx) => {
            const letter = letters[pIdx] || String.fromCharCode(65 + pIdx);
            lines.push(`${letter}:)${transformText(premise.text.trim())}`);
          });
        }
        lines.push('RIGHT:');
        lines.push('');
        break;
      }

      case 'essay': {
        lines.push(`Q:${qNum})${qText}`);
        lines.push('');
        break;
      }

      default: {
        lines.push(`Q:${qNum})${qText}`);
        if (q.options) {
          q.options.forEach((opt) => {
            lines.push(`${opt.key}:)${transformText(opt.text.trim())}`);
          });
        }
        if (q.rawRightAnswer) {
          lines.push(q.rawRightAnswer);
        }
        lines.push('');
        break;
      }
    }
  });

  return lines.join('\n').trim();
}

/**
 * Menghasilkan naskah HTML terformat rapi khusus untuk di-paste langsung ke CKEditor di CBT.
 * Seluruh rumus matematika KaTeX otomatis diubah menjadi tag <img> CodeCogs,
 * sehingga saat di-Ctrl+V di CKEditor, rumus langsung menjadi gambar visual tanpa repot!
 */
export function formatExamToCkEditorHtml(
  config: { jenisUjian: string; mapel: string; kelas: string; semester?: string; tahunPelajaran?: string },
  questions: QuestionItem[],
  format: 'png' | 'svg' = 'png'
): string {
  const normKelas = normalizeKelas(config.kelas);

  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Soal CBT ${config.jenisUjian} - ${config.mapel}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13pt; line-height: 1.6; color: #111; }
    .soal-item { margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px dashed #ccc; }
    .soal-pertanyaan { font-weight: normal; margin-bottom: 8px; }
    .soal-nomor { font-weight: bold; margin-right: 6px; }
    .opsi-list { list-style-type: none; padding-left: 20px; margin: 6px 0; }
    .opsi-item { margin-bottom: 5px; }
    .opsi-key { font-weight: bold; margin-right: 6px; }
    .kunci-jawaban { font-size: 10pt; color: #2e7d32; font-family: monospace; margin-top: 6px; }
    img.latex-equation, img.latex-equation-inline { vertical-align: middle; }
  </style>
</head>
<body>
`;

  questions.forEach((q, idx) => {
    const qNum = q.number || idx + 1;
    const qTextWithImages = replaceLatexWithImgTags(q.text.trim(), format);

    html += `  <div class="soal-item" id="soal-${qNum}">\n`;
    html += `    <div class="soal-pertanyaan">\n`;
    html += `      <span class="soal-nomor">${qNum}.</span>\n`;
    html += `      <span>${qTextWithImages}</span>\n`;
    html += `    </div>\n`;

    if ((q.type === 'single_choice' || q.type === 'multiple_choice') && q.options && q.options.length > 0) {
      html += `    <ul class="opsi-list">\n`;
      q.options.forEach((opt) => {
        const optTextWithImages = replaceLatexWithImgTags(opt.text.trim(), format);
        html += `      <li class="opsi-item"><span class="opsi-key">${opt.key}.</span> ${optTextWithImages}</li>\n`;
      });
      html += `    </ul>\n`;
    } else if (q.type === 'short_answer') {
      const ansWithImages = replaceLatexWithImgTags((q.options?.[0]?.text || '').trim(), format);
      html += `    <p style="font-style:italic;color:#666;">(Jawaban Singkat: ${ansWithImages})</p>\n`;
    } else if (q.type === 'ordering' && q.orderingItems) {
      html += `    <ol style="padding-left:24px;margin:6px 0;">\n`;
      q.orderingItems.forEach((item) => {
        const itemText = replaceLatexWithImgTags(item.text.trim(), format);
        html += `      <li>${itemText}</li>\n`;
      });
      html += `    </ol>\n`;
    } else if (q.type === 'matching') {
      html += `    <table style="width:100%;border-collapse:collapse;margin:8px 0;" border="1" cellpadding="6">\n`;
      html += `      <tr style="background:#f5f5f5;"><th>No</th><th>Pernyataan / Premis</th><th>Pilihan Pasangan</th></tr>\n`;
      const maxRows = Math.max(q.matchingPremises?.length || 0, q.matchingResponses?.length || 0);
      for (let i = 0; i < maxRows; i++) {
        const premise = q.matchingPremises?.[i];
        const response = q.matchingResponses?.[i];
        const pText = premise ? replaceLatexWithImgTags(premise.text.trim(), format) : '';
        const rText = response ? replaceLatexWithImgTags(response.text.trim(), format) : '';
        html += `      <tr>\n`;
        html += `        <td style="text-align:center;">${i + 1}</td>\n`;
        html += `        <td>${premise ? `<b>${premise.id}.</b> ` : ''}${pText}</td>\n`;
        html += `        <td>${response ? `<b>${response.key}.</b> ` : ''}${rText}</td>\n`;
        html += `      </tr>\n`;
      }
      html += `    </table>\n`;
    }

    if (q.rawRightAnswer) {
      html += `    <div class="kunci-jawaban">KUNCI: ${q.rawRightAnswer}</div>\n`;
    }

    html += `  </div>\n\n`;
  });

  html += `</body>\n</html>`;
  return html;
}

/**
 * Mengonversi naskah CBT format teks baris-demi-baris (MODULE:=, TOPIC:=, Q:1), A:), RIGHT:)
 * menjadi HTML di mana setiap baris dibungkus tag <p>...</p> dan rumus matematika
 * otomatis menjadi tag <img> (CodeCogs Math API).
 * 
 * Dengan membungkus tiap baris dalam tag <p>, CKEditor TIDAK AKAN menggabungkan
 * seluruh soal menjadi 1 baris panjang, melainkan tetap tersusun rapi per baris
 * sehingga parser CBT (Candy CBT / AIOCBT / dsb.) dapat memproses tombol "Proceed" dengan sukses!
 */
export function formatCbtTextAsCkEditorHtml(
  rawCbtText: string,
  format: 'png' | 'svg' = 'png'
): string {
  if (!rawCbtText || !rawCbtText.trim()) {
    return '<p></p>';
  }

  const lines = rawCbtText.split(/\r?\n/);
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return '<p><br></p>';
      }
      const withImages = replaceLatexWithImgTags(trimmed, format);
      return `<p style="margin:0 0 2px 0; font-family:Arial,sans-serif; font-size:12pt;">${withImages}</p>`;
    })
    .join('\n');
}

/**
 * Mengonversi naskah CBT format teks bebas (seperti yang ada di textarea teks box)
 * langsung menjadi HTML terstruktur untuk CKEditor, dengan seluruh rumus matematika
 * otomatis diubah menjadi tag <img> (CodeCogs Math API).
 */
export function convertRawCbtTextToCkEditorHtml(
  rawCbtText: string,
  format: 'png' | 'svg' = 'png'
): string {
  return formatCbtTextAsCkEditorHtml(rawCbtText, format);
}

/**
 * Menyalin konten Rich Text / HTML langsung ke clipboard sistem.
 * Saat pengguna melakukan Ctrl+V di CKEditor CBT, CKEditor akan memproses
 * MIME type 'text/html' sehingga rumus matematika otomatis berupa gambar!
 */
export async function copyRichHtmlToClipboard(htmlString: string, plainTextFallback: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const htmlBlob = new Blob([htmlString], { type: 'text/html' });
      const textBlob = new Blob([plainTextFallback], { type: 'text/plain' });
      const item = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      });
      await navigator.clipboard.write([item]);
      return true;
    } else {
      await navigator.clipboard.writeText(plainTextFallback);
      return true;
    }
  } catch (err) {
    console.warn('Rich clipboard write failed, falling back to writeText:', err);
    try {
      await navigator.clipboard.writeText(plainTextFallback);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Contoh teks sesuai format persis permintaan guru/madrasah
 */
export const CBT_FORMAT_EXAMPLE = `MODULE:=ASTS_10
TOPIC:=Sejarah_10

Q:1)Jeruk adalah salah satu jenis …..
A:)Buah
B:)Hewan
C:)Makanan
D:)Pekerjaan
E:)Mebel
RIGHT:A

Q:2)Angka 10 adalah penjulahan dari …
A:)5+5
B:)6+4
C:)5+6
D:)7+4
E:)8+5
RIGHT:A,B

Q:3)Nama Ibukota Indonesia adalah ….. 
( jawablah dengan mengetikkan huruf kapital pada kotak yang disediakan )
A:)JAKARTA
RIGHT:A

Q:4)Dari atas ke bawah urutan anggota tubuh yang benar adalah …..
A:)Kepala
B:)Pundak
C:)Perut
D:)Paha
E:)Kaki
RIGHT:

Q:5)Berikan nama simbol yang tepat dari butir Pancasila di bawah ini:
1.\tBintang
2.\tRantai
3.\tPohon Beringin
4.\tKepala Banteng
5.\tKapas dan Padi
6.\tPohon Jati
7.\tTali
8.\tGandum dan Sagu
A:)Ketuhanan Yang Maha Esa
B:)Kemanusiaan yang adil dan beradab
C:)Persatuan Indonesia
D:)Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan perwakilan
E:)Keadilan sosial bagi seluruh rakyat Indonesia
RIGHT:

Q:6)Jelaskan terjadinya proses hujan secara terperinci!`;
