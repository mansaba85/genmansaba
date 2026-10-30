/**
 * Generator Diagram & Ilustrasi Vektor Edukasi Resmi MA NU 01 Banyuputih
 * Menghasilkan kode SVG murni (vector standalone) berkualitas tinggi,
 * 100% reliabel, instan (0ms), tidak bergantung pada server luar yang sering timeout/diblokir,
 * dan beresolusi tajam saat dicetak (A4) maupun diimpor ke sistem CBT.
 */

export interface DiagramPresetItem {
  id: string;
  name: string;
  mapel: string;
  category: string;
  prompt: string;
}

export const EDUCATIONAL_DIAGRAM_PRESETS: DiagramPresetItem[] = [
  {
    id: 'daun_dikotil',
    name: 'Penampang Daun Dikotil',
    mapel: 'Biologi',
    category: 'Sains Hayati',
    prompt: 'Diagram penampang melintang daun dikotil dengan stomata, epidermis, mesofil palisade, dan berkas pengangkut xilem floem',
  },
  {
    id: 'sel_tumbuhan',
    name: 'Struktur Sel Tumbuhan',
    mapel: 'Biologi',
    category: 'Sains Hayati',
    prompt: 'Diagram struktur sel tumbuhan lengkap dengan dinding sel, kloroplas, vakuola besar, dan nukleus',
  },
  {
    id: 'nefron_ginjal',
    name: 'Struktur Nefron Ginjal',
    mapel: 'Biologi',
    category: 'Sains Hayati',
    prompt: 'Diagram nefron ginjal dengan glomerulus, kapsula bowman, tubulus proksimal, lengkung henle, dan tubulus kolektivus',
  },
  {
    id: 'jantung_manusia',
    name: 'Anatomi Jantung & Sirkulasi',
    mapel: 'Biologi',
    category: 'Sains Hayati',
    prompt: 'Diagram anatomi jantung manusia 4 ruang: serambi kanan, bilik kanan, serambi kiri, bilik kiri, dan aorta',
  },
  {
    id: 'jaring_makanan',
    name: 'Rantai & Jaring Makanan',
    mapel: 'Biologi',
    category: 'Ekologi',
    prompt: 'Diagram jaring-jaring makanan ekosistem darat dengan produsen, konsumen tingkat 1, 2, 3, dan pengurai',
  },
  {
    id: 'rangkaian_listrik',
    name: 'Rangkaian Listrik Campuran (Ohm)',
    mapel: 'Fisika',
    category: 'Fisika & Elektronika',
    prompt: 'Diagram skematik rangkaian listrik seri-paralel dengan resistor R1, R2, R3, baterai V, dan saklar',
  },
  {
    id: 'bidang_miring',
    name: 'Dinamika Gerak Bidang Miring',
    mapel: 'Fisika',
    category: 'Mekanika',
    prompt: 'Diagram gaya balok pada bidang miring dengan sudut elevasi theta, gaya berat W, gaya normal N, dan gaya gesek f',
  },
  {
    id: 'gelombang_transversal',
    name: 'Gelombang Transversal & Sinus',
    mapel: 'Fisika',
    category: 'Gelombang',
    prompt: 'Diagram gelombang transversal dengan bukit, lembah, panjang gelombang lambda, dan amplitudo A',
  },
  {
    id: 'vektor_resultan',
    name: 'Resultan Vektor Gaya F1 & F2',
    mapel: 'Fisika',
    category: 'Vektor',
    prompt: 'Diagram penjumlahan resultan dua vektor F1 dan F2 dengan sudut apit alfa pada koordinat kartesius',
  },
  {
    id: 'struktur_atom_bohr',
    name: 'Model Struktur Atom Bohr',
    mapel: 'Kimia',
    category: 'Kimia Anorganik',
    prompt: 'Diagram model atom Bohr dengan inti bermuatan positif dan elektron pada lintasan kulit K, L, M',
  },
  {
    id: 'alat_titrasi',
    name: 'Perangkat Titrasi Asam-Basa',
    mapel: 'Kimia',
    category: 'Kimia Analitik',
    prompt: 'Diagram susunan alat titrasi laboratorium dengan buret skala mililiter, statif, klem, dan labu erlenmeyer',
  },
  {
    id: 'sel_volta',
    name: 'Sel Elektrokimia / Sel Volta',
    mapel: 'Kimia',
    category: 'Elektrokimia',
    prompt: 'Diagram sel volta dengan elektroda seng Zn, tembaga Cu, jembatan garam, dan voltmeter',
  },
  {
    id: 'segitiga_phytagoras',
    name: 'Segitiga Siku-Siku Phytagoras',
    mapel: 'Matematika',
    category: 'Geometri',
    prompt: 'Diagram segitiga siku-siku ABC dengan panjang sisi alas a, tinggi b, hipotenusa c, dan sudut siku-siku 90 derajat',
  },
  {
    id: 'limas_segiempat',
    name: 'Bangun Ruang Limas Segiempat',
    mapel: 'Matematika',
    category: 'Geometri Dimensi 3',
    prompt: 'Diagram bangun ruang limas tegak T.ABCD dengan rusuk alas s, tinggi limas t, dan jaring-jaring sisi tegak',
  },
  {
    id: 'kurva_parabola',
    name: 'Grafik Fungsi Kuadrat (Parabola)',
    mapel: 'Matematika',
    category: 'Aljabar & Kalkulus',
    prompt: 'Grafik fungsi kuadrat parabola y = ax^2 + bx + c dengan sumbu simetri, titik balik minimum, dan titik potong sumbu X',
  },
  {
    id: 'permintaan_penawaran',
    name: 'Kurva Permintaan & Penawaran',
    mapel: 'Ekonomi',
    category: 'Ekonomi Mikro',
    prompt: 'Kurva permintaan demand dan penawaran supply dengan sumbu harga P dan kuantitas Q serta titik keseimbangan pasar E',
  },
  {
    id: 'lapisan_bumi',
    name: 'Lapisan Struktur Dalam Bumi',
    mapel: 'Geografi',
    category: 'Geologi',
    prompt: 'Diagram irisan melintang lapisan bumi: kerak bumi crust, mantel bumi mantle, inti luar, dan inti dalam',
  },
  {
    id: 'siklus_hidrologi',
    name: 'Siklus Air (Hidrologi)',
    mapel: 'Geografi',
    category: 'Klimatologi & Hidrosfer',
    prompt: 'Diagram siklus hidrologi air dengan proses evaporasi, transpirasi, kondensasi awan, presipitasi hujan, dan perkolasi',
  },
];

/**
 * Menghasilkan SVG vector diagram yang disesuaikan secara dinamis
 * berdasarkan kata kunci prompt, materi, atau mata pelajaran.
 */
export function generateEducationalDiagramSvg(
  promptText: string,
  mapelHint?: string,
  styleHint?: string
): string {
  const query = (promptText + ' ' + (mapelHint || '')).toLowerCase();

  // 1. Biologi: Penampang Daun Dikotil
  if (query.includes('daun') || query.includes('stomata') || query.includes('palisade') || query.includes('mesofil')) {
    return createDaunDikotilSvg(promptText);
  }

  // 2. Biologi: Sel Tumbuhan
  if (query.includes('sel tumbuhan') || (query.includes('kloroplas') && query.includes('sel')) || query.includes('dinding sel')) {
    return createSelTumbuhanSvg(promptText);
  }

  // 3. Biologi: Nefron Ginjal
  if (query.includes('nefron') || query.includes('ginjal') || query.includes('glomerulus') || query.includes('bowman')) {
    return createNefronGinjalSvg(promptText);
  }

  // 4. Biologi: Jantung & Sirkulasi
  if (query.includes('jantung') || query.includes('aorta') || query.includes('serambi') || query.includes('bilik')) {
    return createJantungSvg(promptText);
  }

  // 5. Biologi: Rantai / Jaring Makanan
  if (query.includes('makanan') || query.includes('trofik') || query.includes('produsen') || query.includes('konsumen')) {
    return createRantaiMakananSvg(promptText);
  }

  // 6. Fisika: Rangkaian Listrik
  if (query.includes('rangkaian') || query.includes('listrik') || query.includes('resistor') || query.includes('ohm') || query.includes('tegangan')) {
    return createRangkaianListrikSvg(promptText);
  }

  // 7. Fisika: Bidang Miring & Gaya
  if (query.includes('bidang miring') || (query.includes('balok') && query.includes('gaya')) || query.includes('kemiringan')) {
    return createBidangMiringSvg(promptText);
  }

  // 8. Fisika: Gelombang Transversal
  if (query.includes('gelombang') || query.includes('amplitudo') || query.includes('panjang gelombang') || query.includes('sinus')) {
    return createGelombangSvg(promptText);
  }

  // 9. Fisika: Vektor Resultan
  if (query.includes('vektor') || query.includes('resultan') || query.includes('sudut apit')) {
    return createVektorSvg(promptText);
  }

  // 10. Kimia: Struktur Atom Bohr
  if (query.includes('atom') || query.includes('bohr') || query.includes('elektron') || query.includes('kulit k')) {
    return createStrukturAtomSvg(promptText);
  }

  // 11. Kimia: Alat Titrasi
  if (query.includes('titrasi') || query.includes('buret') || query.includes('erlenmeyer') || query.includes('asam basa')) {
    return createAlatTitrasiSvg(promptText);
  }

  // 12. Kimia: Sel Volta
  if (query.includes('sel volta') || query.includes('anoda') || query.includes('katoda') || query.includes('jembatan garam')) {
    return createSelVoltaSvg(promptText);
  }

  // 13. Matematika: Segitiga Phytagoras
  if (query.includes('segitiga') || query.includes('phytagoras') || query.includes('hipotenusa') || query.includes('siku-siku')) {
    return createSegitigaPhytagorasSvg(promptText);
  }

  // 14. Matematika: Limas / Kubus / Geometri Dimensi Tiga
  if (query.includes('limas') || query.includes('kubus') || query.includes('balok') || query.includes('bangun ruang')) {
    return createBangunRuangSvg(promptText);
  }

  // 15. Matematika: Grafik Parabola / Fungsi Kuadrat
  if (query.includes('parabola') || query.includes('kuadrat') || query.includes('kurva fungsi') || query.includes('kartesius')) {
    return createParabolaSvg(promptText);
  }

  // 16. Ekonomi: Kurva Permintaan & Penawaran
  if (query.includes('permintaan') || query.includes('penawaran') || query.includes('equilibrium') || query.includes('harga pasar') || query.includes('demand')) {
    return createKurvaEkonomiSvg(promptText);
  }

  // 17. Geografi: Lapisan Bumi & Struktur
  if (query.includes('lapisan bumi') || query.includes('kerak bumi') || query.includes('mantel') || query.includes('atmosfer')) {
    return createLapisanBumiSvg(promptText);
  }

  // 18. Geografi: Siklus Hidrologi / Air
  if (query.includes('siklus air') || query.includes('hidrologi') || query.includes('evaporasi') || query.includes('presipitasi')) {
    return createSiklusAirSvg(promptText);
  }

  // Default: Dynamic Conceptual Schematic Diagram for Any Subject
  return createGenericEducationalSvg(promptText, mapelHint);
}

/**
 * Konversi string SVG menjadi Data URI Base64
 */
export function svgToDataUri(svgString: string): string {
  const base64 = Buffer.from(svgString).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// ============================================================================
// TEMPLATE KHUSUS DOMAIN PENDIDIKAN MADRASAH (VEKTOR PRESISI TINGGI)
// ============================================================================

function createDaunDikotilSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="48" fill="#045f3b"/>
  <text x="384" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">DIAGRAM PENAMPANG MELINTANG DAUN DIKOTIL</text>
  
  <!-- Kutikula & Epidermis Atas -->
  <rect x="120" y="80" width="528" height="16" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5" rx="3"/>
  <text x="660" y="93" font-family="sans-serif" font-size="12" font-weight="bold" fill="#854d0e">Kutikula &amp; Epidermis Atas</text>
  <line x1="648" y1="88" x2="656" y2="88" stroke="#ca8a04" stroke-width="2"/>

  <!-- Jaringan Tiang (Mesofil Palisade) -->
  <g fill="#86efac" stroke="#16a34a" stroke-width="1.5">
    ${[...Array(16)].map((_, i) => `<rect x="${125 + i * 32.5}" y="102" width="28" height="110" rx="6"/>`).join('')}
  </g>
  <text x="660" y="155" font-family="sans-serif" font-size="12" font-weight="bold" fill="#15803d">Jaringan Tiang (Palisade)</text>
  <line x1="648" y1="150" x2="656" y2="150" stroke="#16a34a" stroke-width="2"/>

  <!-- Berkas Pembuluh (Xilem & Floem) -->
  <circle cx="384" cy="275" r="50" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/>
  <circle cx="384" cy="260" r="22" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5"/>
  <text x="384" y="264" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0369a1" text-anchor="middle">Xilem</text>
  <ellipse cx="384" cy="295" rx="28" ry="14" fill="#fbcfe8" stroke="#db2777" stroke-width="1.5"/>
  <text x="384" y="299" font-family="sans-serif" font-size="10" font-weight="bold" fill="#9d174d" text-anchor="middle">Floem</text>

  <!-- Jaringan Bunga Karang (Spons) -->
  <g fill="#bbf7d0" stroke="#22c55e" stroke-width="1.5">
    ${[...Array(14)].map((_, i) => `<circle cx="${140 + (i % 7) * 75 + ((i > 6) ? 35 : 0)}" cy="${225 + Math.floor(i / 7) * 55}" r="22"/>`).join('')}
  </g>
  <text x="660" y="240" font-family="sans-serif" font-size="12" font-weight="bold" fill="#166534">Jaringan Spons (Bunga Karang)</text>
  <line x1="648" y1="235" x2="656" y2="235" stroke="#22c55e" stroke-width="2"/>

  <!-- Epidermis Bawah & Stomata -->
  <rect x="120" y="340" width="180" height="16" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5" rx="3"/>
  <!-- Celah Stomata 1 -->
  <circle cx="320" cy="348" r="8" fill="#4ade80" stroke="#15803d" stroke-width="2"/>
  <circle cx="338" cy="348" r="8" fill="#4ade80" stroke="#15803d" stroke-width="2"/>
  <rect x="360" y="340" width="288" height="16" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5" rx="3"/>
  <text x="660" y="348" font-family="sans-serif" font-size="12" font-weight="bold" fill="#854d0e">Epidermis Bawah</text>

  <!-- Penunjuk Stomata -->
  <path d="M 330 365 L 330 400 L 260 400" fill="none" stroke="#047857" stroke-width="2"/>
  <text x="250" y="404" font-family="sans-serif" font-size="12" font-weight="bold" fill="#065f46" text-anchor="end">Stomata (Sel Penjaga)</text>

  <rect x="120" y="420" width="528" height="36" fill="#f8fafc" stroke="#e2e8f0" rx="8"/>
  <text x="384" y="443" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">MA NU 01 Banyuputih · Stimulus Soal Asesmen Biologi Fase E / Fase F</text>
</svg>`;
}

function createRangkaianListrikSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="48" fill="#0f2742"/>
  <text x="384" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">SKEMA RANGKAIAN LISTRIK CAMPURAN (HUKUM OHM)</text>

  <!-- Kawat Utama -->
  <path d="M 120 240 L 120 120 L 280 120" fill="none" stroke="#0f172a" stroke-width="3"/>
  <path d="M 120 240 L 120 360 L 640 360 L 640 120 L 520 120" fill="none" stroke="#0f172a" stroke-width="3"/>

  <!-- Sumber Tegangan Baterai V di sebelah kiri -->
  <line x1="120" y1="220" x2="120" y2="235" stroke="#0f172a" stroke-width="3"/>
  <line x1="100" y1="235" x2="140" y2="235" stroke="#dc2626" stroke-width="4"/>
  <line x1="108" y1="245" x2="132" y2="245" stroke="#0f172a" stroke-width="4"/>
  <line x1="120" y1="245" x2="120" y2="260" stroke="#0f172a" stroke-width="3"/>
  <text x="80" y="245" font-family="sans-serif" font-size="14" font-weight="bold" fill="#dc2626" text-anchor="end">E = 12 Volt</text>

  <!-- Resistor R1 (Seri) -->
  <rect x="280" y="105" width="80" height="30" fill="#fed7aa" stroke="#c2410c" stroke-width="2" rx="4"/>
  <text x="320" y="125" font-family="sans-serif" font-size="13" font-weight="bold" fill="#9a3412" text-anchor="middle">R1 = 4 Ω</text>
  <line x1="360" y1="120" x2="400" y2="120" stroke="#0f172a" stroke-width="3"/>

  <!-- Percabangan Paralel R2 dan R3 -->
  <circle cx="400" cy="120" r="4" fill="#0f172a"/>
  <path d="M 400 120 L 400 70 L 430 70" fill="none" stroke="#0f172a" stroke-width="3"/>
  <path d="M 400 120 L 400 170 L 430 170" fill="none" stroke="#0f172a" stroke-width="3"/>

  <!-- Resistor R2 (Atas) -->
  <rect x="430" y="55" width="80" height="30" fill="#bae6fd" stroke="#0284c7" stroke-width="2" rx="4"/>
  <text x="470" y="75" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0369a1" text-anchor="middle">R2 = 6 Ω</text>

  <!-- Resistor R3 (Bawah) -->
  <rect x="430" y="155" width="80" height="30" fill="#bae6fd" stroke="#0284c7" stroke-width="2" rx="4"/>
  <text x="470" y="175" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0369a1" text-anchor="middle">R3 = 3 Ω</text>

  <!-- Gabungan Kembali -->
  <path d="M 510 70 L 540 70 L 540 120" fill="none" stroke="#0f172a" stroke-width="3"/>
  <path d="M 510 170 L 540 170 L 540 120" fill="none" stroke="#0f172a" stroke-width="3"/>
  <circle cx="540" cy="120" r="4" fill="#0f172a"/>
  <line x1="540" y1="120" x2="640" y2="120" stroke="#0f172a" stroke-width="3"/>

  <!-- Arah Arus I -->
  <polygon points="200,115 215,120 200,125" fill="#dc2626"/>
  <text x="210" y="105" font-family="sans-serif" font-size="13" font-weight="bold" fill="#dc2626" text-anchor="middle">Arus Total (I)</text>

  <!-- Kotak Info Perhitungan -->
  <rect x="180" y="390" width="408" height="55" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" rx="10"/>
  <text x="384" y="413" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">Pertanyaan: Tentukan kuat arus listrik (I) yang mengalir pada R2!</text>
  <text x="384" y="433" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">Naskah Asesmen Sumatif Fisika · MA NU 01 Banyuputih</text>
</svg>`;
}

function createSegitigaPhytagorasSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="48" fill="#1e3a8a"/>
  <text x="384" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">GEOMETRI: TEOREMA PHYTAGORAS PADA SEGITIGA SIKU-SIKU</text>

  <!-- Segitiga Siku-Siku ABC -->
  <polygon points="180,360 560,360 180,120" fill="#eff6ff" stroke="#1d4ed8" stroke-width="3.5"/>

  <!-- Tanda Siku-Siku di titik A -->
  <rect x="180" y="335" width="25" height="25" fill="none" stroke="#1d4ed8" stroke-width="2"/>

  <!-- Titik Sudut A, B, C -->
  <circle cx="180" cy="360" r="5" fill="#1e40af"/>
  <text x="160" y="380" font-family="sans-serif" font-size="16" font-weight="bold" fill="#1e3a8a">A (90°)</text>

  <circle cx="560" cy="360" r="5" fill="#1e40af"/>
  <text x="575" y="375" font-family="sans-serif" font-size="16" font-weight="bold" fill="#1e3a8a">B</text>

  <circle cx="180" cy="120" r="5" fill="#1e40af"/>
  <text x="175" y="105" font-family="sans-serif" font-size="16" font-weight="bold" fill="#1e3a8a">C</text>

  <!-- Label Sisi-Sisi -->
  <!-- Sisi Alas a = AB -->
  <text x="370" y="390" font-family="sans-serif" font-size="15" font-weight="bold" fill="#047857" text-anchor="middle">Sisi Alas (a) = 12 cm</text>
  
  <!-- Sisi Tegak b = AC -->
  <text x="110" y="245" font-family="sans-serif" font-size="15" font-weight="bold" fill="#b45309" text-anchor="middle">Tinggi (b) = 9 cm</text>

  <!-- Sisi Miring c = BC (Hipotenusa) -->
  <text x="400" y="225" font-family="sans-serif" font-size="16" font-weight="bold" fill="#b91c1c" text-anchor="middle">Sisi Miring (c) = ?</text>

  <!-- Kotak Rumus Teorema -->
  <rect x="470" y="90" width="250" height="110" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" rx="10"/>
  <text x="595" y="118" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">Rumus Teorema:</text>
  <text x="595" y="145" font-family="sans-serif" font-size="15" font-weight="bold" fill="#b91c1c" text-anchor="middle">c² = a² + b²</text>
  <text x="595" y="175" font-family="sans-serif" font-size="13" font-weight="semibold" fill="#334155" text-anchor="middle">c = √(12² + 9²)</text>

  <rect x="180" y="420" width="408" height="36" fill="#f1f5f9" stroke="#cbd5e1" rx="8"/>
  <text x="384" y="443" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">MA NU 01 Banyuputih · Soal Ujian Matematika Dasar &amp; Geometri</text>
</svg>`;
}

function createKurvaEkonomiSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="48" fill="#065f46"/>
  <text x="384" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">KURVA KESEIMBANGAN PASAR (PERMINTAAN &amp; PENAWARAN)</text>

  <!-- Sumbu Koordinat P dan Q -->
  <!-- Sumbu P (Harga) -->
  <line x1="140" y1="400" x2="140" y2="80" stroke="#0f172a" stroke-width="3"/>
  <polygon points="135,80 140,65 145,80" fill="#0f172a"/>
  <text x="130" y="75" font-family="sans-serif" font-size="15" font-weight="bold" fill="#0f172a" text-anchor="end">Harga (P)</text>

  <!-- Sumbu Q (Kuantitas) -->
  <line x1="140" y1="400" x2="660" y2="400" stroke="#0f172a" stroke-width="3"/>
  <polygon points="660,395 675,400 660,405" fill="#0f172a"/>
  <text x="670" y="425" font-family="sans-serif" font-size="15" font-weight="bold" fill="#0f172a" text-anchor="end">Jumlah Barang (Q)</text>
  <text x="125" y="420" font-family="sans-serif" font-size="14" font-weight="bold" fill="#64748b">0</text>

  <!-- Kurva Permintaan (Demand - D) Turun dari Kiri Atas ke Kanan Bawah -->
  <line x1="180" y1="120" x2="600" y2="360" stroke="#dc2626" stroke-width="4"/>
  <text x="615" y="370" font-family="sans-serif" font-size="16" font-weight="bold" fill="#dc2626">Demand (D)</text>

  <!-- Kurva Penawaran (Supply - S) Naik dari Kiri Bawah ke Kanan Atas -->
  <line x1="180" y1="360" x2="600" y2="120" stroke="#2563eb" stroke-width="4"/>
  <text x="615" y="125" font-family="sans-serif" font-size="16" font-weight="bold" fill="#2563eb">Supply (S)</text>

  <!-- Titik Keseimbangan (Equilibrium - E) di Titik Temu (390, 240) -->
  <circle cx="390" cy="240" r="7" fill="#047857" stroke="#ffffff" stroke-width="2"/>
  <text x="405" y="235" font-family="sans-serif" font-size="16" font-weight="bold" fill="#047857">E (Keseimbangan)</text>

  <!-- Garis Putus-putus ke Sumbu P dan Q -->
  <line x1="140" y1="240" x2="390" y2="240" stroke="#047857" stroke-width="2" stroke-dasharray="6,4"/>
  <line x1="390" y1="240" x2="390" y2="400" stroke="#047857" stroke-width="2" stroke-dasharray="6,4"/>

  <!-- Label Titik Pe dan Qe -->
  <text x="130" y="245" font-family="sans-serif" font-size="14" font-weight="bold" fill="#047857" text-anchor="end">Pe (Rp 50.000)</text>
  <text x="390" y="420" font-family="sans-serif" font-size="14" font-weight="bold" fill="#047857" text-anchor="middle">Qe (100 Unit)</text>

  <!-- Keterangan Daerah -->
  <rect x="230" y="440" width="320" height="28" fill="#f8fafc" stroke="#cbd5e1" rx="6"/>
  <text x="390" y="458" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">MA NU 01 Banyuputih · Soal Ujian Ekonomi / IPS</text>
</svg>`;
}

function createStrukturAtomSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="48" fill="#4338ca"/>
  <text x="384" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">MODEL STRUKTUR ATOM BOHR (NATRIUM - ₁₁Na)</text>

  <!-- Inti Atom (Nukleus) -->
  <circle cx="384" cy="250" r="38" fill="#fee2e2" stroke="#dc2626" stroke-width="3"/>
  <text x="384" y="245" font-family="sans-serif" font-size="12" font-weight="bold" fill="#991b1b" text-anchor="middle">11 Proton (p⁺)</text>
  <text x="384" y="262" font-family="sans-serif" font-size="12" font-weight="bold" fill="#475569" text-anchor="middle">12 Neutron (n⁰)</text>

  <!-- Kulit Atom 1 (Kulit K - 2 Elektron) -->
  <circle cx="384" cy="250" r="75" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="5,4"/>
  <circle cx="384" cy="175" r="7" fill="#2563eb"/>
  <circle cx="384" cy="325" r="7" fill="#2563eb"/>
  <text x="465" y="195" font-family="sans-serif" font-size="12" font-weight="bold" fill="#4338ca">Kulit K (2 e⁻)</text>

  <!-- Kulit Atom 2 (Kulit L - 8 Elektron) -->
  <circle cx="384" cy="250" r="125" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="5,4"/>
  ${[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
    const rad = (angle * Math.PI) / 180;
    const x = 384 + 125 * Math.cos(rad);
    const y = 250 + 125 * Math.sin(rad);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="#2563eb"/>`;
  }).join('')}
  <text x="520" y="165" font-family="sans-serif" font-size="12" font-weight="bold" fill="#4338ca">Kulit L (8 e⁻)</text>

  <!-- Kulit Atom 3 (Kulit M - 1 Elektron Valensi) -->
  <circle cx="384" cy="250" r="175" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
  <circle cx="384" cy="75" r="9" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
  <text x="398" y="75" font-family="sans-serif" font-size="12" font-weight="bold" fill="#b45309">Elektron Valensi (1 e⁻)</text>
  <text x="575" y="130" font-family="sans-serif" font-size="12" font-weight="bold" fill="#b45309">Kulit M (1 e⁻)</text>

  <!-- Keterangan Soal -->
  <rect x="180" y="440" width="408" height="28" fill="#f8fafc" stroke="#cbd5e1" rx="6"/>
  <text x="384" y="458" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">MA NU 01 Banyuputih · Soal Asesmen Kimia Kelas X / XI</text>
</svg>`;
}

function createSelTumbuhanSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="48" fill="#045f3b"/>
  <text x="384" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">STRUKTUR SEL TUMBUHAN BESERTA ORGANEL UTAMA</text>

  <!-- Dinding Sel Luar (Poligonal Hijau) -->
  <polygon points="160,110 500,90 600,240 540,400 180,410 100,260" fill="#dcfce7" stroke="#16a34a" stroke-width="6"/>
  <polygon points="166,118 494,98 590,240 534,392 186,402 108,260" fill="#f0fdf4" stroke="#22c55e" stroke-width="3"/>

  <!-- Vakuola Sentral Besar di Tengah -->
  <ellipse cx="330" cy="260" rx="130" ry="85" fill="#e0f2fe" stroke="#0284c7" stroke-width="2.5"/>
  <text x="330" y="265" font-family="sans-serif" font-size="15" font-weight="bold" fill="#0369a1" text-anchor="middle">Vakuola Sentral</text>

  <!-- Inti Sel (Nukleus) -->
  <circle cx="490" cy="180" r="45" fill="#fbcfe8" stroke="#db2777" stroke-width="2.5"/>
  <circle cx="490" cy="180" r="18" fill="#be185d"/>
  <text x="490" y="235" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9d174d" text-anchor="middle">Nukleus</text>

  <!-- Kloroplas (Organel Fotosintesis) -->
  <ellipse cx="210" cy="180" rx="28" ry="16" fill="#86efac" stroke="#15803d" stroke-width="2"/>
  <line x1="195" y1="180" x2="225" y2="180" stroke="#15803d" stroke-width="2"/>
  <text x="210" y="210" font-family="sans-serif" font-size="11" font-weight="bold" fill="#14532d" text-anchor="middle">Kloroplas</text>

  <ellipse cx="440" cy="340" rx="28" ry="16" fill="#86efac" stroke="#15803d" stroke-width="2"/>
  <line x1="425" y1="340" x2="455" y2="340" stroke="#15803d" stroke-width="2"/>

  <!-- Mitokondria -->
  <ellipse cx="230" cy="340" rx="26" ry="15" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/>
  <text x="230" y="370" font-family="sans-serif" font-size="11" font-weight="bold" fill="#9a3412" text-anchor="middle">Mitokondria</text>

  <!-- Label Petunjuk Samping -->
  <text x="630" y="110" font-family="sans-serif" font-size="12" font-weight="bold" fill="#15803d">1. Dinding Sel</text>
  <text x="630" y="140" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0369a1">2. Vakuola Air</text>
  <text x="630" y="170" font-family="sans-serif" font-size="12" font-weight="bold" fill="#9d174d">3. Inti Sel (DNA)</text>
  <text x="630" y="200" font-family="sans-serif" font-size="12" font-weight="bold" fill="#166534">4. Kloroplas</text>

  <rect x="180" y="440" width="408" height="28" fill="#f8fafc" stroke="#cbd5e1" rx="6"/>
  <text x="384" y="458" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">MA NU 01 Banyuputih · Soal Asesmen Biologi Sel</text>
</svg>`;
}

function createNefronGinjalSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="48" fill="#045f3b"/>
  <text x="384" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">STRUKTUR NEFRON GINJAL (PROSES PEMBENTUKAN URINE)</text>

  <!-- Kapsula Bowman & Glomerulus (Bagian 1) -->
  <circle cx="180" cy="160" r="35" fill="#fee2e2" stroke="#dc2626" stroke-width="3"/>
  <circle cx="180" cy="160" r="18" fill="#ef4444"/>
  <text x="180" y="110" font-family="sans-serif" font-size="13" font-weight="bold" fill="#b91c1c" text-anchor="middle">Glomerulus &amp; Kapsula Bowman</text>
  <text x="180" y="125" font-family="sans-serif" font-size="11" fill="#7f1d1d" text-anchor="middle">(Filtrasi -> Urine Primer)</text>

  <!-- Tubulus Kontortus Proksimal (Bagian 2) -->
  <path d="M 215 160 C 260 140, 260 200, 310 180" fill="none" stroke="#f59e0b" stroke-width="8"/>
  <text x="310" y="150" font-family="sans-serif" font-size="12" font-weight="bold" fill="#b45309" text-anchor="middle">TKP (Reabsorpsi)</text>

  <!-- Lengkung Henle (Bagian 3) -->
  <path d="M 310 180 L 310 360 C 310 400, 370 400, 370 360 L 370 180" fill="none" stroke="#3b82f6" stroke-width="8"/>
  <text x="340" y="420" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1d4ed8" text-anchor="middle">Lengkung Henle</text>

  <!-- Tubulus Kontortus Distal (Bagian 4) -->
  <path d="M 370 180 C 420 160, 420 210, 470 190" fill="none" stroke="#10b981" stroke-width="8"/>
  <text x="470" y="160" font-family="sans-serif" font-size="12" font-weight="bold" fill="#047857" text-anchor="middle">TKD (Augmentasi)</text>

  <!-- Tubulus Kolektivus (Bagian 5) -->
  <path d="M 470 190 L 530 190 L 530 100 M 530 190 L 530 380" fill="none" stroke="#6366f1" stroke-width="12"/>
  <text x="590" y="250" font-family="sans-serif" font-size="13" font-weight="bold" fill="#4338ca">Tubulus Kolektivus</text>
  <text x="590" y="270" font-family="sans-serif" font-size="11" fill="#312e81">(Menuju Pelvis Ginjal)</text>

  <rect x="180" y="440" width="408" height="28" fill="#f8fafc" stroke="#cbd5e1" rx="6"/>
  <text x="384" y="458" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">MA NU 01 Banyuputih · Soal Asesmen Sistem Ekskresi</text>
</svg>`;
}

function createJantungSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="48" fill="#991b1b"/>
  <text x="384" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">ANATOMI JANTUNG MANUSIA (4 RUANG UTAMA)</text>

  <!-- Skema 4 Ruang Jantung -->
  <!-- Serambi Kanan (Atrium Dextra - Kaya CO2) -->
  <rect x="230" y="100" width="140" height="120" fill="#dbeafe" stroke="#1d4ed8" stroke-width="3" rx="12"/>
  <text x="300" y="150" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e40af" text-anchor="middle">Serambi Kanan</text>
  <text x="300" y="170" font-family="sans-serif" font-size="11" fill="#3b82f6" text-anchor="middle">(Atrium Kanan - CO₂)</text>

  <!-- Serambi Kiri (Atrium Sinistra - Kaya O2) -->
  <rect x="390" y="100" width="140" height="120" fill="#fee2e2" stroke="#dc2626" stroke-width="3" rx="12"/>
  <text x="460" y="150" font-family="sans-serif" font-size="13" font-weight="bold" fill="#991b1b" text-anchor="middle">Serambi Kiri</text>
  <text x="460" y="170" font-family="sans-serif" font-size="11" fill="#ef4444" text-anchor="middle">(Atrium Kiri - O₂)</text>

  <!-- Bilik Kanan (Ventrikel Dextra) -->
  <rect x="230" y="240" width="140" height="140" fill="#bfdbfe" stroke="#1d4ed8" stroke-width="3" rx="12"/>
  <text x="300" y="300" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e40af" text-anchor="middle">Bilik Kanan</text>
  <text x="300" y="320" font-family="sans-serif" font-size="11" fill="#2563eb" text-anchor="middle">(Ke Paru-Paru)</text>

  <!-- Bilik Kiri (Ventrikel Sinistra - Otot Paling Tebal) -->
  <rect x="390" y="240" width="140" height="140" fill="#fecaca" stroke="#dc2626" stroke-width="4" rx="12"/>
  <text x="460" y="300" font-family="sans-serif" font-size="13" font-weight="bold" fill="#991b1b" text-anchor="middle">Bilik Kiri</text>
  <text x="460" y="320" font-family="sans-serif" font-size="11" fill="#dc2626" text-anchor="middle">(Ke Seluruh Tubuh)</text>

  <!-- Pembuluh Darah Utama: Aorta -->
  <path d="M 460 100 L 460 60 L 520 60" fill="none" stroke="#dc2626" stroke-width="8"/>
  <text x="530" y="65" font-family="sans-serif" font-size="12" font-weight="bold" fill="#dc2626">Aorta</text>

  <!-- Vena Cava -->
  <path d="M 300 100 L 300 60 L 240 60" fill="none" stroke="#1d4ed8" stroke-width="8"/>
  <text x="230" y="65" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1d4ed8" text-anchor="end">Vena Kava</text>

  <rect x="180" y="440" width="408" height="28" fill="#f8fafc" stroke="#cbd5e1" rx="6"/>
  <text x="384" y="458" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">MA NU 01 Banyuputih · Soal Asesmen Sistem Peredaran Darah</text>
</svg>`;
}

function createRantaiMakananSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="48" fill="#045f3b"/>
  <text x="384" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">RANTAI MAKANAN &amp; TINGKAT TROFIK EKOSISTEM</text>

  <!-- 1. Produsen (Padi/Tumbuhan) -->
  <rect x="40" y="160" width="110" height="90" fill="#dcfce7" stroke="#16a34a" stroke-width="2" rx="10"/>
  <text x="95" y="195" font-family="sans-serif" font-size="13" font-weight="bold" fill="#14532d" text-anchor="middle">Padi / Rumput</text>
  <text x="95" y="225" font-family="sans-serif" font-size="11" font-weight="bold" fill="#16a34a" text-anchor="middle">(Trofik I - Produsen)</text>

  <!-- Panah 1 -->
  <line x1="155" y1="205" x2="185" y2="205" stroke="#045f3b" stroke-width="3"/>
  <polygon points="185,200 195,205 185,210" fill="#045f3b"/>

  <!-- 2. Konsumen I (Belalang/Herbivora) -->
  <rect x="200" y="160" width="110" height="90" fill="#fef08a" stroke="#ca8a04" stroke-width="2" rx="10"/>
  <text x="255" y="195" font-family="sans-serif" font-size="13" font-weight="bold" fill="#713f12" text-anchor="middle">Belalang</text>
  <text x="255" y="225" font-family="sans-serif" font-size="11" font-weight="bold" fill="#854d0e" text-anchor="middle">(Trofik II - Konsumen I)</text>

  <!-- Panah 2 -->
  <line x1="315" y1="205" x2="345" y2="205" stroke="#045f3b" stroke-width="3"/>
  <polygon points="345,200 355,205 345,210" fill="#045f3b"/>

  <!-- 3. Konsumen II (Katak/Karnivora) -->
  <rect x="360" y="160" width="110" height="90" fill="#fed7aa" stroke="#ea580c" stroke-width="2" rx="10"/>
  <text x="415" y="195" font-family="sans-serif" font-size="13" font-weight="bold" fill="#7c2d12" text-anchor="middle">Katak</text>
  <text x="415" y="225" font-family="sans-serif" font-size="11" font-weight="bold" fill="#c2410c" text-anchor="middle">(Trofik III - Konsumen II)</text>

  <!-- Panah 3 -->
  <line x1="475" y1="205" x2="505" y2="205" stroke="#045f3b" stroke-width="3"/>
  <polygon points="505,200 515,205 505,210" fill="#045f3b"/>

  <!-- 4. Konsumen Puncak (Ular / Elang) -->
  <rect x="520" y="160" width="110" height="90" fill="#fecaca" stroke="#dc2626" stroke-width="2" rx="10"/>
  <text x="575" y="195" font-family="sans-serif" font-size="13" font-weight="bold" fill="#7f1d1d" text-anchor="middle">Elang</text>
  <text x="575" y="225" font-family="sans-serif" font-size="11" font-weight="bold" fill="#dc2626" text-anchor="middle">(Konsumen Puncak)</text>

  <!-- Dekomposer di Bawah -->
  <rect x="290" y="320" width="180" height="60" fill="#f1f5f9" stroke="#475569" stroke-width="2" rx="10"/>
  <text x="380" y="345" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">Pengurai (Bakteri &amp; Jamur)</text>
  <text x="380" y="365" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">Dekomposer</text>

  <rect x="180" y="440" width="408" height="28" fill="#f8fafc" stroke="#cbd5e1" rx="6"/>
  <text x="384" y="458" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">MA NU 01 Banyuputih · Soal Asesmen Ekologi &amp; Lingkungan</text>
</svg>`;
}

function createBidangMiringSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="48" fill="#0f2742"/>
  <text x="384" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">DINAMIKA GERAK: ANALISIS GAYA PADA BIDANG MIRING</text>

  <!-- Bidang Miring Segitiga -->
  <polygon points="120,380 620,380 620,180" fill="#f1f5f9" stroke="#334155" stroke-width="3"/>
  <path d="M 170 380 A 50 50 0 0 0 160 365" fill="none" stroke="#dc2626" stroke-width="2"/>
  <text x="185" y="375" font-family="sans-serif" font-size="14" font-weight="bold" fill="#dc2626">θ = 30°</text>

  <!-- Balok Massa m -->
  <g transform="translate(370, 280) rotate(-22)">
    <rect x="-40" y="-30" width="80" height="60" fill="#fed7aa" stroke="#c2410c" stroke-width="2.5" rx="4"/>
    <text x="0" y="5" font-family="sans-serif" font-size="13" font-weight="bold" fill="#9a3412" text-anchor="middle">m = 5 kg</text>
    
    <!-- Gaya Normal N (Tegak Lurus Bidang) -->
    <line x1="0" y1="-30" x2="0" y2="-90" stroke="#0284c7" stroke-width="3"/>
    <polygon points="-5,-90 0,-100 5,-90" fill="#0284c7"/>
    <text x="10" y="-85" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0284c7">Gaya Normal (N)</text>

    <!-- Gaya Gesek f (Melawan Arah Gerak) -->
    <line x1="40" y1="0" x2="100" y2="0" stroke="#dc2626" stroke-width="3"/>
    <polygon points="100,-5 110,0 100,5" fill="#dc2626"/>
    <text x="115" y="5" font-family="sans-serif" font-size="13" font-weight="bold" fill="#dc2626">Gaya Gesek (f)</text>
  </g>

  <!-- Gaya Berat W (Tegak Lurus Bumi) -->
  <line x1="380" y1="290" x2="380" y2="400" stroke="#16a34a" stroke-width="3"/>
  <polygon points="375,400 380,410 385,400" fill="#16a34a"/>
  <text x="390" y="390" font-family="sans-serif" font-size="13" font-weight="bold" fill="#16a34a">W = m·g</text>

  <rect x="180" y="440" width="408" height="28" fill="#f8fafc" stroke="#cbd5e1" rx="6"/>
  <text x="384" y="458" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">MA NU 01 Banyuputih · Soal Asesmen Fisika Mekanika</text>
</svg>`;
}

function createGelombangSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="48" fill="#0369a1"/>
  <text x="384" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">GELOMBANG TRANSVERSAL: AMPLITUDO &amp; PANJANG GELOMBANG</text>

  <!-- Sumbu Utama -->
  <line x1="80" y1="240" x2="680" y2="240" stroke="#334155" stroke-width="2.5"/>
  <line x1="120" y1="100" x2="120" y2="380" stroke="#334155" stroke-width="2"/>
  <text x="110" y="110" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">y (cm)</text>
  <text x="680" y="265" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">x (meter)</text>

  <!-- Kurva Sinus 2 Gelombang Penuh -->
  <path d="M 120 240 Q 180 120 240 240 T 360 240 T 480 240 T 600 240" fill="none" stroke="#2563eb" stroke-width="4"/>

  <!-- Penunjuk Amplitudo (A) -->
  <line x1="180" y1="240" x2="180" y2="180" stroke="#dc2626" stroke-width="2"/>
  <polygon points="176,185 180,180 184,185" fill="#dc2626"/>
  <text x="195" y="210" font-family="sans-serif" font-size="13" font-weight="bold" fill="#dc2626">Amplitudo (A) = 10 cm</text>

  <!-- Penunjuk 1 Panjang Gelombang (Lambda) -->
  <line x1="120" y1="120" x2="360" y2="120" stroke="#047857" stroke-width="2.5"/>
  <polygon points="125,116 120,120 125,124" fill="#047857"/>
  <polygon points="355,116 360,120 355,124" fill="#047857"/>
  <text x="240" y="110" font-family="sans-serif" font-size="14" font-weight="bold" fill="#047857" text-anchor="middle">1 Panjang Gelombang (λ) = 2 Meter</text>

  <!-- Keterangan Titik -->
  <text x="180" y="170" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1e40af" text-anchor="middle">Puncak</text>
  <text x="300" y="320" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1e40af" text-anchor="middle">Lembah</text>

  <rect x="180" y="440" width="408" height="28" fill="#f8fafc" stroke="#cbd5e1" rx="6"/>
  <text x="384" y="458" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">MA NU 01 Banyuputih · Soal Asesmen Getaran &amp; Gelombang</text>
</svg>`;
}

function createVektorSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="48" fill="#1e293b"/>
  <text x="384" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">RESULTAN VEKTOR GAYA (METODE JAJARGENJANG)</text>

  <!-- Titik Tangkap O -->
  <circle cx="220" cy="340" r="6" fill="#0f172a"/>
  <text x="205" y="355" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0f172a">O</text>

  <!-- Vektor F1 (Mendatar) -->
  <line x1="220" y1="340" x2="520" y2="340" stroke="#2563eb" stroke-width="4"/>
  <polygon points="520,335 535,340 520,345" fill="#2563eb"/>
  <text x="545" y="345" font-family="sans-serif" font-size="14" font-weight="bold" fill="#2563eb">F1 = 8 N</text>

  <!-- Vektor F2 (Miring 60 derajat) -->
  <line x1="220" y1="340" x2="380" y2="140" stroke="#16a34a" stroke-width="4"/>
  <polygon points="375,145 385,135 385,150" fill="#16a34a"/>
  <text x="395" y="135" font-family="sans-serif" font-size="14" font-weight="bold" fill="#16a34a">F2 = 6 N</text>

  <!-- Garis Bantu Jajargenjang -->
  <line x1="520" y1="340" x2="680" y2="140" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6,4"/>
  <line x1="380" y1="140" x2="680" y2="140" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6,4"/>

  <!-- Vektor Resultan R (Diagonal) -->
  <line x1="220" y1="340" x2="680" y2="140" stroke="#dc2626" stroke-width="4.5"/>
  <polygon points="670,145 685,135 680,150" fill="#dc2626"/>
  <text x="700" y="140" font-family="sans-serif" font-size="15" font-weight="bold" fill="#dc2626">Resultan (R)</text>

  <!-- Sudut Apit Alfa -->
  <path d="M 280 340 A 60 60 0 0 0 255 295" fill="none" stroke="#d97706" stroke-width="2.5"/>
  <text x="290" y="315" font-family="sans-serif" font-size="13" font-weight="bold" fill="#d97706">α = 60°</text>

  <rect x="180" y="440" width="408" height="28" fill="#f8fafc" stroke="#cbd5e1" rx="6"/>
  <text x="384" y="458" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">MA NU 01 Banyuputih · Soal Asesmen Vektor Fisika</text>
</svg>`;
}

function createAlatTitrasiSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="48" fill="#045f3b"/>
  <text x="384" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">PERANGKAT TITRASI ASAM-BASA LABORATORIUM KIMIA</text>

  <!-- Statif & Klem -->
  <rect x="220" y="400" width="180" height="20" fill="#334155" rx="4"/>
  <rect x="240" y="80" width="14" height="320" fill="#64748b"/>
  <rect x="240" y="180" width="120" height="10" fill="#475569"/>

  <!-- Buret (Tabung Kaca Panjang dengan Skala) -->
  <rect x="350" y="70" width="22" height="220" fill="#e0f2fe" stroke="#0284c7" stroke-width="2" rx="3"/>
  ${[...Array(10)].map((_, i) => `<line x1="350" y1="${90 + i * 18}" x2="${358 + (i % 2 === 0 ? 6 : 0)}" y2="${90 + i * 18}" stroke="#0369a1" stroke-width="1.5"/>`).join('')}
  <text x="390" y="140" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0369a1">Buret (Titran NaOH 0,1 M)</text>

  <!-- Keran Buret (Stopcock) -->
  <rect x="345" y="285" width="32" height="12" fill="#ca8a04" rx="2"/>
  <line x1="361" y1="297" x2="361" y2="320" stroke="#0284c7" stroke-width="3"/>

  <!-- Labu Erlenmeyer di Bawah Buret -->
  <polygon points="330,340 390,340 430,410 290,410" fill="#fdf2f8" stroke="#db2777" stroke-width="2.5"/>
  <rect x="340" y="325" width="40" height="20" fill="#fdf2f8" stroke="#db2777" stroke-width="2"/>
  
  <!-- Larutan dalam Erlenmeyer dengan Indikator PP (Merah Muda) -->
  <polygon points="310,380 410,380 425,408 295,408" fill="#f472b6" opacity="0.7"/>
  <text x="360" y="398" font-family="sans-serif" font-size="11" font-weight="bold" fill="#831843" text-anchor="middle">Titrat + Indikator PP</text>

  <!-- Keterangan Label Samping -->
  <rect x="520" y="100" width="210" height="130" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" rx="8"/>
  <text x="625" y="125" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">Komponen Titrasi:</text>
  <text x="535" y="150" font-family="sans-serif" font-size="11" fill="#334155">1. Titran: Buret volume awal</text>
  <text x="535" y="170" font-family="sans-serif" font-size="11" fill="#334155">2. Titrat: HCl volume 25 mL</text>
  <text x="535" y="190" font-family="sans-serif" font-size="11" fill="#334155">3. Indikator: Fenolftalein (PP)</text>
  <text x="535" y="210" font-family="sans-serif" font-size="11" font-weight="bold" fill="#db2777">Titik Akhir: Warna merah muda</text>

  <rect x="180" y="440" width="408" height="28" fill="#f8fafc" stroke="#cbd5e1" rx="6"/>
  <text x="384" y="458" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">MA NU 01 Banyuputih · Soal Asesmen Kimia Analitik</text>
</svg>`;
}

function createSelVoltaSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="48" fill="#0f2742"/>
  <text x="384" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">SKEMA SEL VOLTA (ELEKTROKIMIA Zn - Cu)</text>

  <!-- Gelas Kimia 1: Anoda Zn -->
  <rect x="160" y="220" width="160" height="160" fill="#f0f9ff" stroke="#0284c7" stroke-width="3" rx="8"/>
  <rect x="165" y="260" width="150" height="115" fill="#bae6fd" opacity="0.6"/>
  <rect x="220" y="170" width="30" height="160" fill="#94a3b8" stroke="#475569" stroke-width="2.5"/>
  <text x="235" y="155" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">Anoda Zn (-)</text>
  <text x="240" y="340" font-family="sans-serif" font-size="11" font-weight="bold" fill="#0369a1" text-anchor="middle">Larutan ZnSO₄</text>

  <!-- Gelas Kimia 2: Katoda Cu -->
  <rect x="440" y="220" width="160" height="160" fill="#fef2f2" stroke="#dc2626" stroke-width="3" rx="8"/>
  <rect x="445" y="260" width="150" height="115" fill="#fecaca" opacity="0.6"/>
  <rect x="500" y="170" width="30" height="160" fill="#f97316" stroke="#c2410c" stroke-width="2.5"/>
  <text x="515" y="155" font-family="sans-serif" font-size="13" font-weight="bold" fill="#9a3412" text-anchor="middle">Katoda Cu (+)</text>
  <text x="520" y="340" font-family="sans-serif" font-size="11" font-weight="bold" fill="#b91c1c" text-anchor="middle">Larutan CuSO₄</text>

  <!-- Jembatan Garam (KNO3) -->
  <path d="M 280 280 L 280 190 C 280 170, 480 170, 480 190 L 480 280" fill="none" stroke="#f59e0b" stroke-width="18"/>
  <text x="380" y="160" font-family="sans-serif" font-size="12" font-weight="bold" fill="#b45309" text-anchor="middle">Jembatan Garam</text>

  <!-- Voltmeter & Kawat Penghubung -->
  <path d="M 235 170 L 235 90 L 350 90" fill="none" stroke="#0f172a" stroke-width="3"/>
  <circle cx="380" cy="90" r="25" fill="#ffffff" stroke="#0f172a" stroke-width="3"/>
  <text x="380" y="96" font-family="sans-serif" font-size="14" font-weight="bold" fill="#dc2626" text-anchor="middle">1,10 V</text>
  <path d="M 410 90 L 515 90 L 515 170" fill="none" stroke="#0f172a" stroke-width="3"/>

  <!-- Aliran Elektron -->
  <text x="290" y="80" font-family="sans-serif" font-size="12" font-weight="bold" fill="#2563eb">Aliran e⁻ --&gt;</text>

  <rect x="180" y="440" width="408" height="28" fill="#f8fafc" stroke="#cbd5e1" rx="6"/>
  <text x="384" y="458" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">MA NU 01 Banyuputih · Soal Asesmen Kimia Elektrokimia</text>
</svg>`;
}

function createBangunRuangSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="48" fill="#1e3a8a"/>
  <text x="384" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">GEOMETRI DIMENSI 3: LIMAS SEGIEMPAT TEGAK (T.ABCD)</text>

  <!-- Alas Jajargenjang ABCD (Tampak Perspektif) -->
  <polygon points="220,360 480,360 560,280 300,280" fill="#f8fafc" stroke="#1e40af" stroke-width="2.5"/>

  <!-- Puncak Limas T -->
  <circle cx="390" cy="110" r="6" fill="#dc2626"/>
  <text x="390" y="95" font-family="sans-serif" font-size="16" font-weight="bold" fill="#dc2626" text-anchor="middle">T (Puncak)</text>

  <!-- Rusuk-Rusuk Tegak -->
  <line x1="390" y1="110" x2="220" y2="360" stroke="#1e40af" stroke-width="3"/>
  <line x1="390" y1="110" x2="480" y2="360" stroke="#1e40af" stroke-width="3"/>
  <line x1="390" y1="110" x2="560" y2="280" stroke="#1e40af" stroke-width="3"/>
  <line x1="390" y1="110" x2="300" y2="280" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,4"/>

  <!-- Titik Sudut Alas -->
  <text x="200" y="375" font-family="sans-serif" font-size="15" font-weight="bold" fill="#1e3a8a">A</text>
  <text x="495" y="375" font-family="sans-serif" font-size="15" font-weight="bold" fill="#1e3a8a">B</text>
  <text x="575" y="285" font-family="sans-serif" font-size="15" font-weight="bold" fill="#1e3a8a">C</text>
  <text x="280" y="275" font-family="sans-serif" font-size="15" font-weight="bold" fill="#1e3a8a">D</text>

  <!-- Tinggi Limas (Garis Tengah Putus-Putus) -->
  <line x1="390" y1="110" x2="390" y2="320" stroke="#dc2626" stroke-width="2" stroke-dasharray="6,4"/>
  <text x="405" y="220" font-family="sans-serif" font-size="13" font-weight="bold" fill="#dc2626">Tinggi (t) = 12 cm</text>

  <!-- Keterangan Rusuk Alas -->
  <text x="350" y="385" font-family="sans-serif" font-size="13" font-weight="bold" fill="#047857" text-anchor="middle">Panjang Rusuk AB = 10 cm</text>

  <rect x="180" y="440" width="408" height="28" fill="#f8fafc" stroke="#cbd5e1" rx="6"/>
  <text x="384" y="458" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">MA NU 01 Banyuputih · Soal Geometri Ruang Matematika</text>
</svg>`;
}

function createParabolaSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="48" fill="#1e3a8a"/>
  <text x="384" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">GRAFIK FUNGSI KUADRAT y = ax² + bx + c</text>

  <!-- Sumbu Koordinat Cartesius -->
  <line x1="80" y1="280" x2="680" y2="280" stroke="#0f172a" stroke-width="2.5"/>
  <polygon points="680,275 695,280 680,285" fill="#0f172a"/>
  <text x="690" y="305" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0f172a">X</text>

  <line x1="384" y1="420" x2="384" y2="70" stroke="#0f172a" stroke-width="2.5"/>
  <polygon points="379,70 384,55 389,70" fill="#0f172a"/>
  <text x="400" y="70" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0f172a">Y</text>

  <!-- Kurva Parabola Terbuka ke Atas: Titik Puncak di (384, 340) -->
  <path d="M 184 100 Q 384 460 584 100" fill="none" stroke="#dc2626" stroke-width="4"/>

  <!-- Titik Balik Minimum (Puncak) -->
  <circle cx="384" cy="340" r="6" fill="#dc2626"/>
  <text x="384" y="370" font-family="sans-serif" font-size="13" font-weight="bold" fill="#b91c1c" text-anchor="middle">Titik Puncak (xp, yp)</text>

  <!-- Titik Potong Sumbu X -->
  <circle cx="230" cy="280" r="5" fill="#2563eb"/>
  <text x="230" y="265" font-family="sans-serif" font-size="12" font-weight="bold" fill="#2563eb" text-anchor="middle">x₁</text>

  <circle cx="538" cy="280" r="5" fill="#2563eb"/>
  <text x="538" y="265" font-family="sans-serif" font-size="12" font-weight="bold" fill="#2563eb" text-anchor="middle">x₂</text>

  <rect x="180" y="440" width="408" height="28" fill="#f8fafc" stroke="#cbd5e1" rx="6"/>
  <text x="384" y="458" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">MA NU 01 Banyuputih · Soal Matematika Aljabar</text>
</svg>`;
}

function createLapisanBumiSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="48" fill="#854d0e"/>
  <text x="384" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">STRUKTUR LAPISAN BUMI (LITOSFER &amp; INTI BUMI)</text>

  <!-- Lapisan-lapisan Setengah Lingkaran -->
  <!-- 1. Kerak Bumi (Crust) -->
  <circle cx="384" cy="250" r="170" fill="#854d0e"/>
  <!-- 2. Mantel Bumi (Mantle) -->
  <circle cx="384" cy="250" r="155" fill="#ea580c"/>
  <!-- 3. Inti Luar (Outer Core - Cair) -->
  <circle cx="384" cy="250" r="105" fill="#facc15"/>
  <!-- 4. Inti Dalam (Inner Core - Padat) -->
  <circle cx="384" cy="250" r="50" fill="#fef08a"/>

  <!-- Label Petunjuk Samping -->
  <text x="580" y="130" font-family="sans-serif" font-size="13" font-weight="bold" fill="#854d0e">1. Kerak Bumi (0-70 km)</text>
  <text x="580" y="180" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ea580c">2. Mantel Bumi (2.900 km)</text>
  <text x="580" y="240" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ca8a04">3. Inti Luar (Cair - Besi &amp; Nikel)</text>
  <text x="580" y="290" font-family="sans-serif" font-size="13" font-weight="bold" fill="#a16207">4. Inti Dalam (Padat)</text>

  <rect x="180" y="440" width="408" height="28" fill="#f8fafc" stroke="#cbd5e1" rx="6"/>
  <text x="384" y="458" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">MA NU 01 Banyuputih · Soal Asesmen Geografi Kebumian</text>
</svg>`;
}

function createSiklusAirSvg(title: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="48" fill="#0369a1"/>
  <text x="384" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">DIAGRAM SIKLUS HIDROLOGI AIR DI BUMI</text>

  <!-- Laut di Sebelah Kanan Bawah -->
  <path d="M 460 380 Q 560 360 768 380 L 768 480 L 460 480 Z" fill="#38bdf8"/>
  <text x="610" y="420" font-family="sans-serif" font-size="15" font-weight="bold" fill="#0369a1">Lautan / Samudra</text>

  <!-- Gunung & Daratan di Sebelah Kiri -->
  <polygon points="40,380 220,160 360,380" fill="#65a30d" stroke="#4d7c0f" stroke-width="3"/>
  <polygon points="180,210 220,160 260,210" fill="#f8fafc"/>
  <text x="220" y="320" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">Daratan &amp; Pegunungan</text>

  <!-- Awan & Presipitasi (Hujan) -->
  <ellipse cx="260" cy="110" rx="65" ry="25" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
  <ellipse cx="300" cy="100" rx="55" ry="28" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2"/>
  <!-- Titik Hujan -->
  ${[...Array(6)].map((_, i) => `<line x1="${240 + i * 15}" y1="145" x2="${230 + i * 15}" y2="175" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="4,4"/>`).join('')}
  <text x="290" y="70" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0369a1">Kondensasi &amp; Hujan (Presipitasi)</text>

  <!-- Panah Evaporasi dari Laut -->
  <path d="M 620 360 L 620 180" fill="none" stroke="#0284c7" stroke-width="3" stroke-dasharray="6,4"/>
  <polygon points="615,180 620,170 625,180" fill="#0284c7"/>
  <text x="635" y="270" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0369a1">Evaporasi (Penguapan)</text>

  <!-- Panah Transpirasi dari Hutan -->
  <path d="M 170 260 L 170 160" fill="none" stroke="#16a34a" stroke-width="3" stroke-dasharray="6,4"/>
  <polygon points="165,160 170,150 175,160" fill="#16a34a"/>
  <text x="180" y="210" font-family="sans-serif" font-size="12" font-weight="bold" fill="#166534">Transpirasi</text>

  <!-- Infiltrasi Air Tanah -->
  <text x="350" y="420" font-family="sans-serif" font-size="12" font-weight="bold" fill="#78350f">Infiltrasi &amp; Aliran Air Tanah</text>

  <rect x="180" y="440" width="408" height="28" fill="#f8fafc" stroke="#cbd5e1" rx="6"/>
  <text x="384" y="458" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">MA NU 01 Banyuputih · Soal Asesmen Geografi Siklus Hidrologi</text>
</svg>`;
}

function createGenericEducationalSvg(title: string, mapel?: string): string {
  const cleanTitle = title.replace(/Q:\d+\)/gi, '').slice(0, 75).trim() || 'Diagram Konsep Pembelajaran';
  const cleanMapel = mapel || 'Mata Pelajaran';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 480" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="100%" height="52" fill="#045f3b"/>
  <text x="384" y="32" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">DIAGRAM SKEMATIK SOAL ASESMEN (${cleanMapel.toUpperCase()})</text>

  <!-- Central Schematic Core -->
  <rect x="234" y="90" width="300" height="70" fill="#f0fdf4" stroke="#16a34a" stroke-width="2.5" rx="12"/>
  <text x="384" y="125" font-family="sans-serif" font-size="14" font-weight="bold" fill="#14532d" text-anchor="middle">${cleanTitle}</text>
  <text x="384" y="145" font-family="sans-serif" font-size="11" fill="#166534" text-anchor="middle">Fokus Konsep &amp; Stimulus Soal</text>

  <!-- 3 Cabang Analisis -->
  <line x1="384" y1="160" x2="384" y2="210" stroke="#045f3b" stroke-width="2.5"/>
  <line x1="184" y1="210" x2="584" y2="210" stroke="#045f3b" stroke-width="2.5"/>

  <!-- Cabang 1: Input / Premis A -->
  <line x1="184" y1="210" x2="184" y2="240" stroke="#045f3b" stroke-width="2.5"/>
  <rect x="94" y="240" width="180" height="90" fill="#eff6ff" stroke="#2563eb" stroke-width="2" rx="10"/>
  <text x="184" y="270" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e40af" text-anchor="middle">Komponen I</text>
  <text x="184" y="295" font-family="sans-serif" font-size="11" fill="#3b82f6" text-anchor="middle">Karakteristik &amp; Sifat</text>
  <text x="184" y="315" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1d4ed8" text-anchor="middle">[Data Stimulus A]</text>

  <!-- Cabang 2: Proses / Premis B -->
  <line x1="384" y1="210" x2="384" y2="240" stroke="#045f3b" stroke-width="2.5"/>
  <rect x="294" y="240" width="180" height="90" fill="#fef08a" stroke="#ca8a04" stroke-width="2" rx="10"/>
  <text x="384" y="270" font-family="sans-serif" font-size="13" font-weight="bold" fill="#854d0e" text-anchor="middle">Mekanisme II</text>
  <text x="384" y="295" font-family="sans-serif" font-size="11" fill="#a16207" text-anchor="middle">Hubungan Sebab-Akibat</text>
  <text x="384" y="315" font-family="sans-serif" font-size="11" font-weight="bold" fill="#713f12" text-anchor="middle">[Reaksi / Dinamika]</text>

  <!-- Cabang 3: Output / Premis C -->
  <line x1="584" y1="210" x2="584" y2="240" stroke="#045f3b" stroke-width="2.5"/>
  <rect x="494" y="240" width="180" height="90" fill="#fee2e2" stroke="#dc2626" stroke-width="2" rx="10"/>
  <text x="584" y="270" font-family="sans-serif" font-size="13" font-weight="bold" fill="#991b1b" text-anchor="middle">Hasil / Output III</text>
  <text x="584" y="295" font-family="sans-serif" font-size="11" fill="#b91c1c" text-anchor="middle">Indikator Terukur</text>
  <text x="584" y="315" font-family="sans-serif" font-size="11" font-weight="bold" fill="#7f1d1d" text-anchor="middle">[Target Jawaban]</text>

  <!-- Petunjuk Soal -->
  <rect x="94" y="360" width="580" height="45" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" rx="8"/>
  <text x="384" y="388" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="middle">Perhatikan diagram di atas untuk menentukan analisis hubungan antar-komponen!</text>

  <rect x="180" y="440" width="408" height="28" fill="#f1f5f9" stroke="#e2e8f0" rx="6"/>
  <text x="384" y="458" font-family="sans-serif" font-size="11" fill="#64748b" text-anchor="middle">MA NU 01 Banyuputih Batang · Bank Diagram Soal Asesmen Mandiri</text>
</svg>`;
}
