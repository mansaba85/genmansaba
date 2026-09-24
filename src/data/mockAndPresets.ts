import { User, ExamPackage, GeneratedAdminDoc, LoginLog, MadrasahIdentity } from '../types';

export const MADRASAH_IDENTITY: MadrasahIdentity = {
  yayasan: "YAYASAN LP MA'ARIF NU KABUPATEN BATANG",
  nama: 'MA NU 01 BANYUPUTIH',
  singkatan: 'MA NU 01 Banyuputih',
  akreditasi: 'TERAKREDITASI A (UNGGUL)',
  alamat: 'Jl. Lapangan 9A Banyuputih, Kab. Batang',
  npsn: '20364930',
  tahunAjaran: '2026/2027',
  semester: 'Ganjil',
  modeJadwal: 'Reguler (Normal)',
  kabupaten: 'Kab. Batang',
  kepalaMadrasah: 'H. Mukhsin, S.Ag., M.Pd.I.',
  nipKepala: '197206151998031002',
  telepon: '(0285) 666789',
  email: 'manubanyuputih@gmail.com',
  website: 'https://manu01banyuputih.sch.id',
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-hariyanto',
    name: 'Bpk. Hariyanto, S.Pd.',
    nip: '198604122011011008',
    role: 'guru',
    mapel: ['Matematika', 'Fisika'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    lastLogin: '21 Sep 2026, 07:15 WIB',
    pin: '123456',
  },
  {
    id: 'user-siti-fatimah',
    name: 'Ibu Siti Fatimah, S.Ag.',
    nip: '198208152009122004',
    role: 'guru',
    mapel: ['Fiqih', 'Bahasa Arab', 'Al-Qur\'an Hadits'],
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    lastLogin: '21 Sep 2026, 08:30 WIB',
    pin: '654321',
  },
  {
    id: 'user-zainal',
    name: 'Admin',
    nip: '-',
    role: 'admin',
    mapel: ['Informatika', 'Kewirausahaan'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    lastLogin: '21 Sep 2026, 06:45 WIB',
    pin: '888888',
  },
  {
    id: 'user-nur-hidayah',
    name: 'Ibu Nur Hidayah, A.Md.',
    nip: '199311052019032015',
    role: 'operator',
    mapel: ['Tata Usaha & Distribusi Dokumen'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    lastLogin: '21 Sep 2026, 07:00 WIB',
    pin: '111111',
  },
];

export const INITIAL_LOGIN_LOGS: LoginLog[] = [
  {
    id: 'log-1',
    userId: 'user-hariyanto',
    userName: 'Bpk. Hariyanto, S.Pd.',
    role: 'guru',
    ip: '192.168.10.42 (Proxmox LAN)',
    timestamp: '21 Sep 2026, 07:15:20 WIB',
    userAgent: 'Chrome 128 on Windows 11',
    action: 'Generate Soal ASTS Matematika LaTeX',
  },
  {
    id: 'log-2',
    userId: 'user-siti-fatimah',
    userName: 'Ibu Siti Fatimah, S.Ag.',
    role: 'guru',
    ip: '192.168.10.88 (Proxmox LAN)',
    timestamp: '21 Sep 2026, 08:30:11 WIB',
    userAgent: 'Edge 127 on macOS',
    action: 'Generate Modul Ajar KBC Fiqih Thaharah',
  },
  {
    id: 'log-3',
    userId: 'user-zainal',
    userName: 'Admin',
    role: 'admin',
    ip: '192.168.10.1 (Proxmox Gateway)',
    timestamp: '21 Sep 2026, 06:45:00 WIB',
    userAgent: 'Firefox Developer Edition on Linux',
    action: 'Cek Status 9router API Gateway & Hermes Agent',
  },
];

export const SAMPLE_EXAM_PACKAGES: ExamPackage[] = [
  {
    id: 'exam-fiqih-01',
    title: 'Paket Soal ASTS Fiqih & Bahasa Arab — Kelas X Gasal',
    config: {
      mapel: 'Fiqih',
      kelas: 'X',
      semester: '1',
      tahunPelajaran: '2025/2026',
      jenisUjian: 'ASTS',
      bahasa: 'campuran',
      capaianPembelajaran: 'Peserta didik mampu menganalisis ketentuan bersuci (thaharah), shalat fardhu dan jenazah, serta zakat sesuai mazhab Syafi\'i berlandaskan nilai-nilai Aswaja An-Nahdliyah.',
      alokasiWaktuMenit: 90,
      selectedTypes: {
        single_choice: 2,
        multiple_choice: 1,
        short_answer: 1,
        ordering: 1,
        matching: 1,
        essay: 1,
      },
      difficultyProportion: { mudah: 30, sedang: 50, sulit: 20 },
      includeAnswerKeyInPrint: true,
      includeRubricInPrint: true,
    },
    createdAt: '2026-09-21T07:30:00Z',
    createdBy: 'Ibu Siti Fatimah, S.Ag.',
    nip: '198208152009122004',
    questions: [
      {
        id: 'q-1',
        number: 1,
        type: 'single_choice',
        text: 'Air yang suci zatnya tetapi tidak dapat mensucikan benda atau hadas lain disebut sebagai air...',
        difficulty: 'mudah',
        kompetensiTarget: 'Klasifikasi Jenis-Jenis Air dalam Thaharah',
        options: [
          { key: 'A', text: 'Thahir Ghairu Muthahhir' },
          { key: 'B', text: 'Muthlaq (Thahir Muthahhir)' },
          { key: 'C', text: 'Musyammas' },
          { key: 'D', text: 'Mutanajjis' },
          { key: 'E', text: 'Musta\'mal makruh' },
        ],
        rawRightAnswer: 'RIGHT:A',
        explanation: 'Air Thahir Ghairu Muthahhir adalah air suci yang telah berubah sifatnya (seperti teh, kopi) sehingga tidak dapat digunakan bersuci.',
      },
      {
        id: 'q-2',
        number: 2,
        type: 'single_choice',
        text: 'مَا هُوَ الرُّكْنُ الْأَوَّلُ مِنْ أَرْكَانِ الْوُضُوْءِ فِي الْمَذْهَبِ الشَّافِعِيِّ؟',
        isArabic: true,
        difficulty: 'sedang',
        kompetensiTarget: 'Rukun Wudhu dalam Teks Arab Fiqih Fathul Qarib',
        options: [
          { key: 'A', text: 'النِّيَّةُ عِنْدَ غَسْلِ الْوَجْهِ', isRtl: true },
          { key: 'B', text: 'غَسْلُ الْيَدَيْنِ إِلَى الْمِرْفَقَيْنِ', isRtl: true },
          { key: 'C', text: 'مَسْحُ بَعْضِ الرَّأْسِ', isRtl: true },
          { key: 'D', text: 'التَّرْتِيْبُ بَيْنَ الْأَعْضَاءِ', isRtl: true },
          { key: 'E', text: 'غَسْلُ الرِّجْلَيْنِ مَعَ الْكَعْبَيْنِ', isRtl: true },
        ],
        rawRightAnswer: 'RIGHT:A',
        explanation: 'Rukun pertama wudhu dalam mazhab Syafi\'i adalah niat yang dibarengkan dengan membasuh muka.',
      },
      {
        id: 'q-3',
        number: 3,
        type: 'multiple_choice',
        text: 'Di antara perkara-perkara berikut, manakah yang termasuk rukun Islam? (Pilihlah semua jawaban yang benar)',
        difficulty: 'mudah',
        kompetensiTarget: 'Pemahaman Fondasi Aqidah dan Syariah',
        options: [
          { key: 'A', text: 'Mengucapkan dua kalimah syahadat' },
          { key: 'B', text: 'Mendirikan shalat lima waktu' },
          { key: 'C', text: 'Membaca kitab suci Al-Qur\'an setiap malam' },
          { key: 'D', text: 'Menunaikan zakat bagi yang mampu' },
          { key: 'E', text: 'Melakukan tadabbur alam semesta' },
        ],
        rawRightAnswer: 'RIGHT:A,B,D',
        explanation: 'Rukun Islam ada 5: Syahadat, Shalat, Zakat, Puasa Ramadhan, dan Haji ke Baitullah.',
      },
      {
        id: 'q-4',
        number: 4,
        type: 'short_answer',
        text: 'Kitab fiqih standar madrasah karya Syaikh Muhammad bin Qasim Al-Ghazi yang menjadi rujukan utama santri NU tingkat pemula adalah...',
        difficulty: 'sedang',
        kompetensiTarget: 'Literasi Turats dan Khazanah Ulama Aswaja',
        options: [
          { key: 'A', text: 'FATHUL QARIB' },
        ],
        rawRightAnswer: 'RIGHT:A',
        explanation: 'Fathul Qarib al-Mujib fi Syarh Alfazh at-Taqrib karangan Ibnu Qasim Al-Ghazi.',
      },
      {
        id: 'q-5',
        number: 5,
        type: 'ordering',
        text: 'Urutkan tahapan pelaksanaan fardhu wudhu berikut dari urutan awal sampai akhir sesuai tertib yang benar!',
        difficulty: 'sedang',
        kompetensiTarget: 'Praktik Bersuci Thaharah',
        orderingItems: [
          { id: 1, text: 'Niat berwudhu bersamaan dengan membasuh muka' },
          { id: 2, text: 'Membasuh kedua tangan hingga siku' },
          { id: 3, text: 'Mengusap sebagian kepala' },
          { id: 4, text: 'Membasuh kedua kaki hingga mata kaki' },
        ],
        rawRightAnswer: 'RIGHT:',
        explanation: 'Urutan rukun wudhu yang runtut: 1. Niat & basuh muka -> 2. Tangan hingga siku -> 3. Usap kepala -> 4. Kaki hingga mata kaki. Pengacakan tampilan dilakukan oleh sistem CBT.',
      },
      {
        id: 'q-6',
        number: 6,
        type: 'matching',
        text: 'Jodohkan jenis zakat berikut dengan objek kewajibannya secara tepat!',
        difficulty: 'sedang',
        kompetensiTarget: 'Ketentuan Pembagian Zakat Maal dan Nafs',
        matchingPremises: [
          { id: 1, text: 'Zakat Fitrah (Nafs)' },
          { id: 2, text: 'Zakat An\'am (Ternak)' },
          { id: 3, text: 'Zakat Tijarah (Perniagaan)' },
          { id: 4, text: 'Zakat Zira\'ah (Pertanian)' },
        ],
        matchingResponses: [
          { key: 'A', text: 'Bahan makanan pokok (beras 2.5 kg / 3.5 liter)' },
          { key: 'B', text: 'Kambing, sapi, dan unta yang digembalakan bebas' },
          { key: 'C', text: 'Nilai modal dan keuntungan barang dagangan' },
          { key: 'D', text: 'Padi atau gandum saat panen melebihi 5 wasaq' },
          { key: 'E', text: 'Barang temuan purbakala (Rikaz)' },
        ],
        rawRightAnswer: 'RIGHT:',
        explanation: 'Pasangan 1-to-1: 1 berpasangan dengan A (Fitrah = Beras), 2 dengan B (An\'am = Ternak), 3 dengan C (Tijarah = Dagang), 4 dengan D (Zira\'ah = Panen). Pengacakan dilakukan oleh sistem CBT.',
      },
      {
        id: 'q-7',
        number: 7,
        type: 'essay',
        text: 'Jelaskan perbedaan mendasar antara Najis Mutawassithah Hukmiyyah dan Najis Mutawassithah \'Ainiyyah, serta uraikan langkah-langkah pensucian masing-masing menurut Mazhab Syafi\'i!',
        difficulty: 'sulit',
        kompetensiTarget: 'Analisis Kaidah Thaharah dan Penanganan Najis',
        rawRightAnswer: 'Uraian Guru (Rubrik Penilaian)',
        essaySampleAnswer: 'Najis \'Ainiyyah adalah najis yang masih memiliki wujud nyata, baik warna, bau, maupun rasanya. Cara menyucikannya harus dihilangkan terlebih dahulu ketiga sifat tersebut dengan air mengalir sampai bersih. Sedangkan Najis Hukmiyyah adalah najis yang diyakini keberadaannya namun sudah tidak tampak lagi zat warna, bau, maupun rasanya (seperti bekas air kencing kering), cara menyucikannya cukup dengan mengalirkan air suci di atas tempat najis tersebut satu kali aliran.',
        essayRubric: [
          { scoreRange: '85 - 100', criteria: 'Menjelaskan definisi kedua najis dengan lengkap, menyebutkan parameter warna/bau/rasa, serta merinci metode pembersihan dengan air mengalir sesuai kaidah mazhab.' },
          { scoreRange: '65 - 84', criteria: 'Menjelaskan perbedaan definisi namun langkah penyucian kurang mendetail atau tidak menyebutkan parameter hilangnya sifat najis.' },
          { scoreRange: '40 - 64', criteria: 'Hanya menjelaskan salah satu jenis najis secara parsial.' },
          { scoreRange: '0 - 39', criteria: 'Jawaban tidak relevan dengan konsep thaharah fiqih.' },
        ],
      },
    ],
  },
  {
    id: 'exam-matematika-02',
    title: 'Paket Soal ASESGA Matematika Peminatan & Fisika — Kelas XI',
    config: {
      mapel: 'Matematika',
      kelas: 'XI',
      semester: '1',
      tahunPelajaran: '2025/2026',
      jenisUjian: 'ASESGA',
      bahasa: 'indonesia',
      capaianPembelajaran: 'Peserta didik mampu mengaplikasikan konsep integral tentu, turunan fungsi trigonometri, dan kalkulus gerak lurus dalam menyelesaikan permasalahan kontekstual.',
      alokasiWaktuMenit: 90,
      selectedTypes: {
        single_choice: 2,
        multiple_choice: 1,
        short_answer: 1,
        ordering: 1,
        matching: 1,
        essay: 1,
      },
      difficultyProportion: { mudah: 25, sedang: 50, sulit: 25 },
      includeAnswerKeyInPrint: true,
      includeRubricInPrint: true,
    },
    createdAt: '2026-09-20T14:10:00Z',
    createdBy: 'Bpk. Hariyanto, S.Pd.',
    nip: '198604122011011008',
    questions: [
      {
        id: 'qm-1',
        number: 1,
        type: 'single_choice',
        text: 'Berapakah nilai dari integral tentu $\\int_0^1 (3x^2 + 2x + 1) dx$ ?',
        hasLatex: true,
        difficulty: 'sedang',
        kompetensiTarget: 'Kalkulus Integral Polinomial Tentu',
        options: [
          { key: 'A', text: '$3$' },
          { key: 'B', text: '$\\frac{5}{2}$' },
          { key: 'C', text: '$2$' },
          { key: 'D', text: '$\\frac{7}{3}$' },
          { key: 'E', text: '$1$' },
        ],
        rawRightAnswer: 'RIGHT:A',
        explanation: '$\\int_0^1 (3x^2 + 2x + 1) dx = [x^3 + x^2 + x]_0^1 = (1 + 1 + 1) - 0 = 3$.',
      },
      {
        id: 'qm-2',
        number: 2,
        type: 'single_choice',
        text: 'Turunan pertama dari fungsi $f(x) = \\sin(2x) \\cdot \\cos(x)$ pada saat $x = 0$ bernilai...',
        hasLatex: true,
        difficulty: 'sedang',
        kompetensiTarget: 'Diferensial Fungsi Trigonometri',
        options: [
          { key: 'A', text: '$2$' },
          { key: 'B', text: '$0$' },
          { key: 'C', text: '$1$' },
          { key: 'D', text: '$-1$' },
          { key: 'E', text: '$-2$' },
        ],
        rawRightAnswer: 'RIGHT:A',
        explanation: '$f\'(x) = 2\\cos(2x)\\cos(x) - \\sin(2x)\\sin(x)$. Pada $x=0$, $f\'(0) = 2(1)(1) - 0 = 2$.',
      },
      {
        id: 'qm-3',
        number: 3,
        type: 'multiple_choice',
        text: 'Diberikan fungsi kuadrat $f(x) = x^2 - 6x + 8$. Manakah pernyataan berikut yang bernilai benar? (Pilihlah semua yang benar)',
        hasLatex: true,
        difficulty: 'mudah',
        kompetensiTarget: 'Analisis Karakteristik Kurva Parabola',
        options: [
          { key: 'A', text: 'Grafik memotong sumbu X di titik $(2, 0)$ dan $(4, 0)$' },
          { key: 'B', text: 'Titik puncak minimum berada pada koordinat $(3, -1)$' },
          { key: 'C', text: 'Sumbu simetri fungsi adalah garis $x = 3$' },
          { key: 'D', text: 'Nilai diskriminan $D < 0$' },
          { key: 'E', text: 'Kurva terbuka ke bawah karena $a > 0$' },
        ],
        rawRightAnswer: 'RIGHT:A,B,C',
        explanation: 'Faktorisasi: $(x-2)(x-4)=0$, akar $x=2$ dan $x=4$. Titik puncak di $(3, -1)$, sumbu simetri $x=3$. $D = 36 - 32 = 4 > 0$. Kurva terbuka ke atas.',
      },
      {
        id: 'qm-4',
        number: 4,
        type: 'short_answer',
        text: 'Kecepatan sesaat partikel dinyatakan dengan persamaan $v(t) = 4t + 3$ (m/s). Berapakah percepatan partikel tersebut dalam satuan m/s²?',
        hasLatex: true,
        difficulty: 'mudah',
        kompetensiTarget: 'Hubungan Kinematika Posisi, Kecepatan, dan Percepatan',
        options: [
          { key: 'A', text: '4' },
        ],
        rawRightAnswer: 'RIGHT:A',
        explanation: 'Percepatan $a(t) = \\frac{dv}{dt} = 4\\text{ m/s}^2$.',
      },
      {
        id: 'qm-5',
        number: 5,
        type: 'ordering',
        text: 'Urutkan tahapan metode ilmiah dalam memecahkan permasalahan fisika mekanika!',
        difficulty: 'sedang',
        kompetensiTarget: 'Metode Ilmiah dan Keterampilan Proses Sains',
        orderingItems: [
          { id: 1, text: 'Mengidentifikasi dan merumuskan masalah' },
          { id: 2, text: 'Merumuskan hipotesis kerja' },
          { id: 3, text: 'Melakukan eksperimen dan mengumpulkan data observasi' },
          { id: 4, text: 'Menarik kesimpulan dan verifikasi teori' },
        ],
        rawRightAnswer: 'RIGHT:',
        explanation: 'Urutan tahapan ilmiah yang runtut: 1. Masalah -> 2. Hipotesis -> 3. Eksperimen -> 4. Kesimpulan. Pengacakan tampilan dilakukan oleh sistem CBT.',
      },
      {
        id: 'qm-6',
        number: 6,
        type: 'matching',
        text: 'Jodohkan lambang besaran fisika berikut dengan satuan SI yang tepat!',
        difficulty: 'sedang',
        kompetensiTarget: 'Dimensi dan Satuan Internasional',
        matchingPremises: [
          { id: 1, text: 'Energi Kinetik ($E_k$)' },
          { id: 2, text: 'Daya Listrik ($P$)' },
          { id: 3, text: 'Tekanan Hidrostatis ($P_h$)' },
          { id: 4, text: 'Frekuensi Gelombang ($f$)' },
        ],
        matchingResponses: [
          { key: 'A', text: 'Joule (kg·m²/s²)' },
          { key: 'B', text: 'Watt (J/s)' },
          { key: 'C', text: 'Pascal (N/m²)' },
          { key: 'D', text: 'Hertz (s⁻¹)' },
          { key: 'E', text: 'Newton (kg·m/s²)' },
        ],
        rawRightAnswer: 'RIGHT:',
        explanation: 'Pasangan 1-to-1: 1 berpasangan dengan A (Energi = Joule), 2 dengan B (Daya = Watt), 3 dengan C (Tekanan = Pascal), 4 dengan D (Frekuensi = Hertz). Pengacakan dilakukan oleh sistem CBT.',
      },
      {
        id: 'qm-7',
        number: 7,
        type: 'essay',
        text: 'Sebuah tangki air berbentuk silinder bocor dengan laju perubahan volume air $\\frac{dV}{dt} = -k\\sqrt{h}$, di mana $h$ adalah tinggi air dan $k$ adalah konstanta positif. Jelaskan model diferensial penentuan waktu pengosongan tangki dan turunkan rumus waktu yang diperlukan hingga tangki kosong seluruhnya!',
        hasLatex: true,
        difficulty: 'sulit',
        kompetensiTarget: 'Aplikasi Persamaan Diferensial Terapan',
        rawRightAnswer: 'Uraian Guru (Rubrik Penilaian)',
        essaySampleAnswer: 'Diketahui volume silinder $V = A\\cdot h$, sehingga $\\frac{dV}{dt} = A\\frac{dh}{dt}$. Disamakan dengan laju kebocoran: $A\\frac{dh}{dt} = -k\\sqrt{h} \\implies \\frac{dh}{\\sqrt{h}} = -\\frac{k}{A}dt$. Diintegrasikan kedua ruas dari $h_0$ ke $0$ dan $t=0$ ke $T$: $[2\\sqrt{h}]_{h_0}^0 = -\\frac{k}{A}T \\implies -2\\sqrt{h_0} = -\\frac{k}{A}T \\implies T = \\frac{2A\\sqrt{h_0}}{k}$.',
        essayRubric: [
          { scoreRange: '85 - 100', criteria: 'Mampu menghubungkan volume dengan ketinggian silinder, memisahkan variabel persamaan diferensial, melakukan integrasi dengan benar, dan menentukan batas $T$ secara matematis tepat.' },
          { scoreRange: '60 - 84', criteria: 'Memisahkan variabel dengan benar namun terdapat kesalahan kalkulus pada proses integrasi pecahan eksponen.' },
          { scoreRange: '30 - 59', criteria: 'Hanya menuliskan hubungan $V = Ah$ tanpa menyelesaikan integral.' },
          { scoreRange: '0 - 29', criteria: 'Tidak dapat merumuskan model diferensial.' },
        ],
      },
    ],
  },
  {
    id: 'exam-matematika-10',
    title: 'Paket Soal ASTS Matematika (Eksponen & Logaritma) — Kelas X',
    config: {
      mapel: 'Matematika',
      kelas: 'X',
      semester: '1',
      tahunPelajaran: '2025/2026',
      jenisUjian: 'ASTS',
      bahasa: 'indonesia',
      capaianPembelajaran: 'Peserta didik mampu menggeneralisasi sifat-sifat bilangan berpangkat (eksponen) dan logaritma serta menerapkannya dalam pemodelan matematis.',
      alokasiWaktuMenit: 90,
      selectedTypes: {
        single_choice: 2,
        multiple_choice: 1,
        short_answer: 1,
        ordering: 1,
        matching: 1,
        essay: 1,
      },
      difficultyProportion: { mudah: 30, sedang: 50, sulit: 20 },
      includeAnswerKeyInPrint: true,
      includeRubricInPrint: true,
    },
    createdAt: '2026-09-21T09:00:00Z',
    createdBy: 'Bpk. Hariyanto, S.Pd.',
    nip: '198604122011011008',
    questions: [
      {
        id: 'qm10-1',
        number: 1,
        type: 'single_choice',
        text: 'Jika terdapat sebuah himpunan penyelesaian dari persamaan eksponen $2^{2x} - 6 \\cdot 2^x + 8 = 0$, berapakah jumlah dari akar-akar persamaan tersebut?',
        hasLatex: true,
        difficulty: 'sedang',
        kompetensiTarget: 'Persamaan Eksponen Kuadratik',
        options: [
          { key: 'A', text: '3' },
          { key: 'B', text: '2' },
          { key: 'C', text: '4' },
          { key: 'D', text: '6' },
          { key: 'E', text: '8' },
        ],
        rawRightAnswer: 'RIGHT:A',
        explanation: 'Misal $y = 2^x$, maka $y^2 - 6y + 8 = 0 \\implies (y-2)(y-4) = 0$. Diperoleh $2^{x_1} = 2 \\implies x_1 = 1$ dan $2^{x_2} = 4 \\implies x_2 = 2$. Jumlah akar-akar $= x_1 + x_2 = 1 + 2 = 3$.',
      },
      {
        id: 'qm10-2',
        number: 2,
        type: 'single_choice',
        text: 'Bentuk sederhana dari operasi aljabar eksponen $\\frac{a^3b^{-2}}{a^{-1}b}$ adalah...',
        hasLatex: true,
        difficulty: 'mudah',
        kompetensiTarget: 'Penyederhanaan Pangkat Bulat Negatif dan Pecahan',
        options: [
          { key: 'A', text: '$a^4b^{-3}$' },
          { key: 'B', text: '$a^2b^{-1}$' },
          { key: 'C', text: '$a^4b^3$' },
          { key: 'D', text: '$a^{-2}b^{-3}$' },
          { key: 'E', text: '$a^3b^{-3}$' },
        ],
        rawRightAnswer: 'RIGHT:A',
        explanation: '$\\frac{a^3b^{-2}}{a^{-1}b} = a^{3 - (-1)} \\cdot b^{-2 - 1} = a^4b^{-3}$.',
      },
      {
        id: 'qm10-3',
        number: 3,
        type: 'multiple_choice',
        text: 'Manakah di antara pernyataan berikut yang benar mengenai sifat-sifat logaritma? (Pilihlah semua jawaban yang benar)',
        hasLatex: true,
        difficulty: 'sedang',
        kompetensiTarget: 'Analisis Sifat-Sifat Operasi Logaritma',
        options: [
          { key: 'A', text: '$^a\\log(b \\cdot c) = ^a\\log b + ^a\\log c$' },
          { key: 'B', text: '$^a\\log(b/c) = ^a\\log b - ^a\\log c$' },
          { key: 'C', text: '$^a\\log b^n = b \\cdot ^a\\log n$' },
          { key: 'D', text: '$^a\\log a = 0$' },
          { key: 'E', text: '$^a\\log 1 = a$' },
        ],
        rawRightAnswer: 'RIGHT:A,B',
        explanation: 'Sifat perkalian dan pembagian logaritma benar (A dan B). C salah karena seharusnya $n \\cdot ^a\\log b$. D salah karena $^a\\log a = 1$. E salah karena $^a\\log 1 = 0$.',
      },
      {
        id: 'qm10-4',
        number: 4,
        type: 'short_answer',
        text: 'Jika $^2\\log 8 = x$, maka nilai dari $x$ adalah...\n( jawablah dengan mengetikkan angka atau huruf kapital pada kotak yang disediakan )',
        hasLatex: true,
        difficulty: 'mudah',
        kompetensiTarget: 'Definisi Dasar Logaritma Berbasis 2',
        options: [
          { key: 'A', text: '3' },
        ],
        rawRightAnswer: 'RIGHT:A',
        explanation: '$^2\\log 8 = ^2\\log 2^3 = 3 \\cdot ^2\\log 2 = 3(1) = 3$.',
      },
      {
        id: 'qm10-5',
        number: 5,
        type: 'ordering',
        text: 'Urutkan nilai bilangan berpangkat berikut dari yang bernilai terkecil hingga terbesar:',
        hasLatex: true,
        difficulty: 'sedang',
        kompetensiTarget: 'Komparasi dan Pengurutan Nilai Eksponen',
        orderingItems: [
          { id: 1, text: '$2^2$' },
          { id: 2, text: '$5^1$' },
          { id: 3, text: '$2^3$' },
          { id: 4, text: '$3^2$' },
          { id: 5, text: '$4^2$' },
        ],
        rawRightAnswer: 'RIGHT:',
        explanation: 'Nilai: $2^2 = 4$, $5^1 = 5$, $2^3 = 8$, $3^2 = 9$, $4^2 = 16$. Urutan nilai dari kecil ke besar: $2^2 < 5^1 < 2^3 < 3^2 < 4^2$.',
      },
      {
        id: 'qm10-6',
        number: 6,
        type: 'matching',
        text: 'Jodohkan operasi logaritma di kolom kiri dengan nilai hasil yang tepat di kolom kanan!',
        hasLatex: true,
        difficulty: 'mudah',
        kompetensiTarget: 'Perhitungan Nilai Logaritma Sederhana',
        matchingPremises: [
          { id: 1, text: '2' },
          { id: 2, text: '3' },
        ],
        matchingResponses: [
          { key: 'A', text: '$^2\\log 4$' },
          { key: 'B', text: '$^3\\log 27$' },
        ],
        rawRightAnswer: 'RIGHT:',
        explanation: 'Hasil 2 cocok dengan $^2\\log 4$ (A), dan hasil 3 cocok dengan $^3\\log 27$ (B).',
      },
      {
        id: 'qm10-7',
        number: 7,
        type: 'essay',
        text: 'Suatu kultur laboratorium mengamati perkembangbiakan bakteri. Diketahui populasi bakteri membelah diri menjadi 2 setiap 30 menit. Jika pada awal pengamatan terdapat 50 sel bakteri:\na. Tentukan model fungsi eksponen $N(t)$ yang menyatakan jumlah bakteri setelah $t$ jam!\nb. Hitunglah perkiraan jumlah populasi bakteri setelah kultur dibiarkan selama 4 jam!',
        hasLatex: true,
        difficulty: 'sulit',
        kompetensiTarget: 'Pemodelan Fungsi Eksponensial Kontekstual',
        rawRightAnswer: 'Uraian Guru (Rubrik Penilaian)',
        essaySampleAnswer: 'a. Karena bakteri membelah setiap 30 menit (2 periode per jam), maka model fungsi eksponen setelah t jam adalah $N(t) = 50 \\times 2^{2t}$, di mana $t$ dalam satuan jam.\nb. Untuk $t = 4$ jam: $N(4) = 50 \\times 2^{2(4)} = 50 \\times 2^8 = 50 \\times 256 = 12.800$ sel bakteri.',
        essayRubric: [
          { scoreRange: '85 - 100', criteria: 'Membuat perumusan fungsi $N(t) = 50 \\times 2^{2t}$ dengan runtut, menjelaskan variabelnya, dan menghitung hasil $12.800$ bakteri dengan teliti.' },
          { scoreRange: '60 - 84', criteria: 'Model fungsi benar namun terjadi kesalahan perhitungan perkalian nilai akhir, atau sebaliknya.' },
          { scoreRange: '30 - 59', criteria: 'Hanya menuliskan rumus umum pertumbuhan eksponen tanpa memasukkan angka 50 dan periode 30 menit.' },
          { scoreRange: '0 - 29', criteria: 'Jawaban tidak sesuai dengan konteks soal.' },
        ],
      },
    ],
  },
];

export const SAMPLE_ADMIN_DOCS: GeneratedAdminDoc[] = [
  {
    id: 'doc-rpp-merdeka-fiqih',
    type: 'rpp',
    title: 'RPP Fiqih Kelas X (Fase E): Ketentuan Thaharah & Kesucian Lahir Batin',
    config: {
      docType: 'rpp',
      mapel: 'Fiqih',
      fase: 'E',
      kelas: 'X',
      semester: '1',
      tahunPelajaran: '2026/2027',
      topikMateri: 'Ketentuan Thaharah dan Kesucian Lahir Batin Berbasis Kasih Sayang',
      alokasiWaktu: '4 JP (2 Pertemuan x 45 Menit)',
      guruPengampu: 'Ibu Siti Fatimah, S.Ag.',
      nipGuru: '198208152009122004',
      kepalaMadrasah: 'H. Mukhsin, S.Ag., M.Pd.I.',
      nipKepala: '197206151998031002',
      nilaiKBC: [
        'Cinta kepada Allah dan Rasul-Nya',
        'Cinta kepada Ilmu Pengetahuan',
        'Cinta kepada Diri dan Sesama'
      ],
      modelPembelajaran: 'Problem Based Learning (PBL) & Understanding by Design (UbD)',
      karakteristikPesertaDidik: 'Kemampuan awal heterogen, kecenderungan gaya belajar visual dan kinestetik, santun dan aktif dalam diskusi kelompok.',
      dimensiProfilLulusan: [
        'Beriman, Bertakwa kepada Tuhan YME, & Berakhlak Mulia',
        'Bernalar Kritis',
        'Mandiri',
        'Bergotong Royong',
        'Berkeadaban (Ta\'addub)',
      ],
      jumlahPertemuan: '2 Pertemuan',
      jamPerPertemuan: '2 JP (2 x 45 menit)',
      jenisAsesmen: [
        'Asesmen Diagnostik (Awal Pembelajaran)',
        'Asesmen Formatif (Proses KBM & LKPD)',
        'Asesmen Sumatif (Akhir TP)',
      ],
    },
    createdAt: '2026-09-21T07:00:00Z',
    createdBy: 'Ibu Siti Fatimah, S.Ag.',
    contentMarkdown: `# RENCANA PELAKSANAAN PEMBELAJARAN (RPP) KURIKULUM MERDEKA
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN 2026/2027
*Berpedoman pada Panduan Pembelajaran dan Asesmen BSKAP Kemendikbudristek & Kemenag RI*

---

### I. ANALISIS KESIAPAN & KARAKTERISTIK PESERTA DIDIK
- **Karakteristik & Gaya Belajar :** Kemampuan awal santri heterogen (sebagian lulusan MTs telah terbiasa hafalan nadhom thaharah, lulusan SMP membutuhkan penguatan dalil dan tata cara wudhu), dominan gaya belajar visual (infografis fikih) dan kinestetik (praktik langsung).
- **Strategi Diferensiasi Pembelajaran :**
  - **Diferensiasi Konten :** Modul fikih ibadah teks, tayangan video tutorial wudhu/tayamum sesuai madzhab Syafi'i, dan bagan klasifikasi najis.
  - **Diferensiasi Proses :** Santri dengan pemahaman awal tinggi menjadi fasilitator kelompok kecil (*peer tutoring*), guru memberi scaffolding pada kelompok yang membutuhkan penguatan konsep air mutlak dan musta'mal.
  - **Diferensiasi Produk :** Pilihan pelaporan: peta konsep jenis-jenis air, demonstrasi video unjuk kerja tayamum, atau lembar portofolio analisis studi kasus najis kontemporer.

---

### II. KOMPONEN INTI PEMBELAJARAN
#### 1. Capaian Pembelajaran (CP) Elemen Fiqih Ibadah
Peserta didik mampu menganalisis tata cara bersuci (thaharah) dari hadas dan najis, mendiagnosis hal-hal yang membatalkan wudhu dan tayamum, serta menumbuhkan kesadaran kesucian lahir batin berlandaskan dalil Al-Qur'an dan Sunnah menurut Madzhab Syafi'i.

#### 2. Tujuan Pembelajaran (TP)
1. Menjelaskan hakikat thaharah dan kedudukannya dalam ajaran Islam sebagai manifestasi cinta kebersihan dan adab ibadah.
2. Mengklasifikasikan macam-macam air dan najis beserta cara mensucikannya secara tepat dan cermat.
3. Mendemonstrasikan tata cara wudhu dan tayamum sesuai rukun dan sunnahnya dengan penuh kesungguhan dan adab thalabul ilmi.

#### 3. Indikator Ketercapaian Tujuan Pembelajaran (IKTP)
- Menyebutkan minimal 7 macam air suci menyucikan dan membedakannya dari air musta'mal dengan ketepatan 80%.
- Menganalisis cara menyucikan najis mukhaffafah, mutawassithah, dan mughalladhah sesuai syariat.
- Mempraktikkan rukun wudhu secara tertib dan tumaninah.

#### 4. Dimensi Profil Lulusan & Profil Pelajar Rahmatan lil Alamin (P5RA)
- Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia (Internalisasi adab bersuci sebelum menghadap Ilahi).
- Bernalar Kritis (Menganalisis hukum air daur ulang dan tayamum di era modern).
- Bergotong Royong & Berkeadaban / Ta'addub (Menjaga kebersihan madrasah dan saling membimbing sesama santri).

---

### III. LANGKAH-LANGKAH KEGIATAN PEMBELAJARAN

#### PERTEMUAN 1: Hakikat Thaharah & Klasifikasi Air / Najis (2 JP x 45 Menit)

| Tahap Kegiatan | Rincian Aktivitas Guru & Peserta Didik | Alokasi Waktu |
|:---|:---|:---:|
| **Pendahuluan** | 1. Guru mengucap salam, membimbing doa pembuka, dan mengajak tadarus Surah Al-Baqarah: 222 (Innallaha yuhibbut tawwabiina wa yuhibbul mutathahhirin).<br>2. Sapaan hangat KBC (*Welcoming with Compassion*) dan cek kehadiran santri.<br>3. Pertanyaan pemantik: *"Mengapa shalat kita tidak sah jika badan bersih tetapi belum berwudhu?"*<br>4. Menyampaikan tujuan dan alur kegiatan KBM. | 15 Menit |
| **Kegiatan Inti**<br>*(Sintaks PBL)* | **Fase 1: Orientasi pada Masalah Kontekstual**<br>- Guru menayangkan kasus: *"Bagaimana status kesucian air tandon madrasah yang kejatuhan cicak atau kotoran burung?"*<br><br>**Fase 2: Pengorganisasian Belajar & LKPD**<br>- Santri dibagi menjadi 5 kelompok heterogen (4-5 siswa).<br>- Membagikan LKPD studi kasus jenis air dan najis.<br><br>**Fase 3: Penyelidikan Mandiri & Diskusi Kelompok**<br>- Santri mengkaji kitab Fathul Qorib dan buku ajar Fiqih Kemenag.<br>- Guru mendampingi santri secara berdiferensiasi. | 60 Menit |
| **Penutup** | 1. Guru dan santri merumuskan rangkuman pokok materi.<br>2. Refleksi makna spiritual: kesucian lahir membuka pintu kejernihan batin.<br>3. Apresiasi santun atas kerja sama kelompok.<br>4. Doa penutup majelis dan salam. | 15 Menit |

---

#### PERTEMUAN 2: Praktik Wudhu, Tayamum & Asesmen Ketercapaian (2 JP x 45 Menit)

| Tahap Kegiatan | Rincian Aktivitas Guru & Peserta Didik | Alokasi Waktu |
|:---|:---|:---:|
| **Pendahuluan** | 1. Pembukaan dengan salam, shalawat tibbil qulub, dan tadarus santun.<br>2. Reviu materi jenis air melalui kuis interaktif singkat (5 menit).<br>3. Orientasi demonstrasi unjuk kerja praktik wudhu dan tayamum. | 10 Menit |
| **Kegiatan Inti**<br>*(Sintaks PBL)* | **Fase 4: Penyajian Hasil Karya & Simulasi Praktik**<br>- Perwakilan kelompok mendemonstrasikan rukun wudhu dan tayamum dengan air/debu suci di tempat wudhu madrasah.<br>- Kelompok penilai memberikan masukan berbasis rubrik adab bersuci.<br><br>**Fase 5: Evaluasi & Asesmen Sumatif**<br>- Guru memberikan klarifikasi terhadap kesalahan umum (seperti batas membasuh wajah dan menyela jari).<br>- Mengerjakan asesmen formatif akhir TP pada lembar evaluasi individu. | 65 Menit |
| **Penutup** | 1. Refleksi bersama: membiasakan dawamul wudhu (menjaga wudhu) dalam kehidupan harian.<br>2. Menyampaikan topik KBM pekan depan.<br>3. Doa kaffaratul majelis dan salam. | 15 Menit |

---

### IV. RANCANGAN ASESMEN PEMBELAJARAN
- **Jenis Asesmen :** Asesmen Diagnostik (Awal), Asesmen Formatif (Proses & LKPD), Asesmen Sumatif (Akhir TP).

#### 1. Asesmen Diagnostik Awal
Tanya jawab lisan 3 butir untuk memetakan kesiapan santri mengenai rukun wudhu dan jenis air.

#### 2. Rubrik Asesmen Formatif (Observasi Sikap & Kinerja Diskusi)
| Aspek Penilaian | Indikator KBC | Skor 1-4 |
|:---|:---|:---:|
| Adab Menuntut Ilmu | Memperhatikan penjelasan guru dan teman, tidak memotong pembicaraan | 4 |
| Kasih Sayang & Tolong Menolong | Membimbing rekan yang belum hafal rukun wudhu secara sabar | 4 |
| Ketepatan Unjuk Kerja | Mempraktikkan tata cara tayamum sesuai urutan rukun | 4 |

#### 3. Asesmen Sumatif & Interval Ketercapaian (KKTP)
| Rentang Nilai | Kategori | Tindak Lanjut |
|:---:|:---:|:---|
| 0 - 65% | Perlu Bimbingan | Remedial pendampingan intensif tata cara wudhu |
| 66% - 75% | Cukup | Remedial mandiri latihan soal identifikasi najis |
| 76% - 85% | Baik | Tuntas, pengayaan studi kasus thaharah kontemporer |
| 86% - 100% | Sangat Baik | Tuntas istimewa, menjadi duta thaharah dan tutor sebaya |`,
  },
  {
    id: 'doc-prota-seni-tari-merdeka',
    type: 'prota',
    title: 'Program Tahunan (PROTA) Seni Tari Fase E / Kelas X — MA NU 01 Banyuputih',
    config: {
      docType: 'prota',
      mapel: 'Seni Tari',
      fase: 'E',
      kelas: 'X',
      semester: '1 & 2',
      tahunPelajaran: '2026/2027',
      topikMateri: 'Makna dan Simbol Tari Tradisi, Apresiasi, dan Rancangan Karya Tari Tradisi',
      alokasiWaktu: '36 JP (Ganjil: 19 JP, Genap: 17 JP)',
      guruPengampu: 'Latifatun Nisa, S.Pd.',
      nipGuru: '-',
      kepalaMadrasah: 'H. Mukhsin, S.Ag., M.Pd.I.',
      nipKepala: '197105142007101001',
      nilaiKBC: [
        'Cinta kepada Ilmu Pengetahuan',
        'Cinta kepada Diri dan Sesama',
        'Cinta kepada Tanah Air'
      ],
      modelPembelajaran: 'Project Based Learning & Inkuiri Artistik',
    },
    createdAt: '2026-08-07T07:30:00Z',
    createdBy: 'Latifatun Nisa, S.Pd.',
    contentMarkdown: `# PROGRAM TAHUNAN KURIKULUM MERDEKA
**MA NU 01 BANYUPUTIH**  
*Jl. Lapangan 9A Banyuputih, Kab. Batang | NPSN: 20364930 | TA: 2026/2027*

---

### IDENTITAS DOKUMEN
- **Nama Sekolah :** MA NU 01 Banyuputih
- **Nama Penyusun :** Latifatun Nisa, S.Pd.
- **Mata Pelajaran :** Seni Tari
- **Fase E, Kelas/Semester :** X (Sepuluh) / I (Ganjil) / II (Genap)
- **Tahun Pelajaran :** 2026/2027

---

### A. CAPAIAN PEMBELAJARAN FASE E
Pada akhir Fase E, peserta didik mampu menginterpretasi, mengaitkan, membandingkan makna dan simbol tari tradisi sebagai pengetahuan dasar untuk merancang dan mengomposisikan karya tari tradisi secara individu ataupun kelompok sebagai wujud aktualisasi diri.

---

### B. ELEMEN CAPAIAN PEMBELAJARAN

| ELEMEN | CAPAIAN PEMBELAJARAN |
|---|---|
| **Mengalami (Experiencing)** | Peserta didik menginterpretasi dan mengaitkan makna dan simbol pada tari tradisi dalam bentuk karya seni pertunjukan. |
| **Merefleksikan (Reflecting)** | Peserta didik membandingkan makna dan simbol dengan mengapresiasi tari tradisi serta membuat ide-ide baru ke dalam karyanya. |
| **Berpikir dan bekerja artistik (Thinking and working artistically)** | Peserta didik merancang dan menunjukan hasil karya tari tradisi secara individu, maupun berkelompok. |
| **Menciptakan (Creating)** | Peserta didik merancang dan menunjukkan hasil karya tari kreasi berdasarkan makna dan simbol dari tari tradisi dalam bentuk karya seni pertunjukan. |
| **Berdampak (Impacting)** | Peserta didik mengaktualisasikan diri melalui pertunjukan tari |

---

### C. PROGRAM TAHUNAN TAHUN PELAJARAN 2026-2027

#### DISTRIBUSI ALOKASI WAKTU SEMESTER I (GANJIL)
- **Mata Pelajaran :** Seni Tari
- **Satuan Pendidikan :** MA NU 01 Banyuputih
- **Tahun Pelajaran :** 2026/2027
- **Fase E Kelas/Semester :** X / I (Ganjil)

| Unit | Materi Pokok | Sub Materi | Alur Tujuan Pembelajaran | Alokasi Waktu |
|:---:|:---|:---|:---|:---:|
| **Unit 1** | Makna dan Simbol pada Tari Tradisi | 1. Pengertian Makna dan Simbol Tari Tradisi<br>2. Makna pada Tari Tradisi<br>3. Simbol pada Tari Tradisi | 1. Peserta didik mampu menginterpretasi dan mengaitkan makna dan simbol pada tari tradisi dalam bentuk karya seni pertunjukan.<br>2. Peserta didik mampu mengaitkan makna dan simbol pada tari tradisi dalam bentuk karya seni pertunjukan. | **10 JP** |
| **Unit 2** | Apresiasi Tari Tradisi | 1. Apresiasi Tari<br>2. Makna dan Simbol Tari Berdasarkan Kajian Tekstual dan Kontekstual<br>3. Ide dalam Membuat Karya | 1. Peserta didik mampu membandingkan makna dan simbol dengan mengapresiasi tari tradisi serta membuat ide-ide baru ke dalam karyanya.<br>2. Peserta didik mampu mengapresiasi makna dan simbol pada tari tradisi untuk membuat ide-ide baru ke dalam karya tari. | **9 JP** |
| **JUMLAH** | | | | **19 JP** |

---

#### DISTRIBUSI ALOKASI WAKTU SEMESTER II (GENAP)
- **Mata Pelajaran :** Seni Tari
- **Satuan Pendidikan :** MA NU 01 Banyuputih
- **Tahun Pelajaran :** 2026/2027
- **Fase E Kelas/Semester :** X / II (Genap)

| Unit | Materi Pokok | Sub Materi | Alur Tujuan Pembelajaran | Alokasi Waktu |
|:---:|:---|:---|:---|:---:|
| **Unit 3** | Rancangan Karya Tari Tradisi Individu dan Kelompok | 1. Menemukan Ide atau Gagasan Karya Tari<br>2. Menemukan Tema Tari Individu maupun Berkelompok<br>3. Mengeksplorasi Gerak Tari Tradisi Individu maupun Berkelompok<br>4. Improvisasi Gerak Tari Individu maupun Berkelompok<br>5. Evaluasi Gerak Tari Berdasarkan Hasil Eksplorasi dan Improvisasi Gerak Tari | 1. Peserta didik mampu merancang hasil karya tari tradisi secara individu maupun berkelompok.<br>2. Peserta didik mampu menunjukkan hasil karya tari tradisi secara individu maupun berkelompok. | **17 JP** |
| **JUMLAH** | | | | **17 JP** |

---

### REKAPITULASI TOTAL ALOKASI WAKTU TAHUNAN
- **Alokasi Waktu Semester I (Ganjil) :** 19 JP
- **Alokasi Waktu Semester II (Genap) :** 17 JP
- **TOTAL KESELURUHAN 1 TAHUN PELAJARAN :** 36 JP
`,
  },
  {
    id: 'doc-prosem-seni-tari-merdeka',
    type: 'prosem',
    title: 'Program Semester (PROSEM) Seni Tari Fase E / Kelas X Semester Ganjil — MA NU 01 Banyuputih',
    config: {
      docType: 'prosem',
      mapel: 'Seni Tari',
      fase: 'E',
      kelas: 'X',
      semester: '1',
      tahunPelajaran: '2026/ 2027',
      topikMateri: 'Makna dan Simbol Tari Tradisi, Apresiasi, dan Rancangan Karya Tari Tradisi',
      alokasiWaktu: '36 JP (Ganjil)',
      guruPengampu: 'Latifatun Nisa, S.Pd.',
      nipGuru: '-',
      kepalaMadrasah: 'H. Mukhsin, S.Ag., M.Pd.I.',
      nipKepala: '197105142007101001',
      nilaiKBC: [
        'Cinta kepada Ilmu Pengetahuan',
        'Cinta kepada Diri dan Sesama',
        'Cinta kepada Tanah Air'
      ],
      modelPembelajaran: 'Project Based Learning & Inkuiri Artistik',
    },
    createdAt: '2026-08-07T08:00:00Z',
    createdBy: 'Latifatun Nisa, S.Pd.',
    contentMarkdown: `<div style="background-color: #65a30d; color: white; padding: 10px 14px; text-align: center; border-radius: 4px; font-weight: bold; margin-bottom: 14px;">
  <div style="font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase;">PROGRAM SEMESTER KURIKULUM MERDEKA</div>
  <div style="font-size: 13px; text-transform: uppercase; margin-top: 2px;">SENI TARI FASE E KELAS X</div>
</div>

<div style="font-size: 11px; margin-bottom: 14px; line-height: 1.6; font-weight: 500;">
  <table style="border: none; border-collapse: collapse; width: 100%; max-width: 480px;">
    <tr><td style="border:none; padding: 1px 0; width: 170px; font-weight: 600;">Mata Pelajaran</td><td style="border:none; padding: 1px 0;">: Seni Tari</td></tr>
    <tr><td style="border:none; padding: 1px 0; font-weight: 600;">Satuan Pendidikan</td><td style="border:none; padding: 1px 0;">: MA NU 01 Banyuputih</td></tr>
    <tr><td style="border:none; padding: 1px 0; font-weight: 600;">Tahun Pelajaran</td><td style="border:none; padding: 1px 0;">: 2026/ 2027</td></tr>
    <tr><td style="border:none; padding: 1px 0; font-weight: 600;">Fase &amp; Kelas/Semester</td><td style="border:none; padding: 1px 0;">: X (Sepuluh) / I (Ganjil)</td></tr>
  </table>
</div>

<table style="width: 100%; border-collapse: collapse; font-size: 9.5px; border: 1px solid #1e293b;">
  <thead>
    <tr style="background-color: #f8fafc;">
      <th rowspan="2" style="border: 1px solid #1e293b; padding: 6px 4px; width: 110px; text-align: center; font-weight: bold;">BAB</th>
      <th rowspan="2" style="border: 1px solid #1e293b; padding: 6px 6px; width: 230px; text-align: center; font-weight: bold;">Alur dan Tujuan Pembelajaran</th>
      <th rowspan="2" style="border: 1px solid #1e293b; padding: 6px 4px; width: 55px; text-align: center; font-weight: bold;">Alokasi Waktu</th>
      <th colspan="4" style="border: 1px solid #1e293b; padding: 4px; text-align: center; font-weight: bold;">Juli</th>
      <th colspan="5" style="border: 1px solid #1e293b; padding: 4px; text-align: center; font-weight: bold;">Agustus</th>
      <th colspan="5" style="border: 1px solid #1e293b; padding: 4px; text-align: center; font-weight: bold;">September</th>
      <th colspan="5" style="border: 1px solid #1e293b; padding: 4px; text-align: center; font-weight: bold;">Oktober</th>
      <th colspan="5" style="border: 1px solid #1e293b; padding: 4px; text-align: center; font-weight: bold;">November</th>
      <th colspan="5" style="border: 1px solid #1e293b; padding: 4px; text-align: center; font-weight: bold;">Desember</th>
    </tr>
    <tr style="background-color: #f1f5f9; font-size: 8.5px;">
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">1</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">2</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">3</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">4</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">1</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">2</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">3</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">4</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">5</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">1</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">2</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">3</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">4</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">5</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">1</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">2</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">3</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">4</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">5</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">1</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">2</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">3</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">4</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">5</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">1</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">2</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">3</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">4</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">5</th>
    </tr>
  </thead>
  <tbody>
    <!-- BAB 1 -->
    <tr>
      <td rowspan="2" style="border: 1px solid #1e293b; padding: 6px; font-weight: bold; vertical-align: top; background-color: #fafafa;">BAB 1 Makna dan Simbol Tari Tradisi</td>
      <td style="border: 1px solid #1e293b; padding: 6px; vertical-align: top;">1. Peserta didik mampu menginterpretasi dan mengaitkan makna dan simbol pada tari tradisi dalam bentuk karya seni pertunjukan..</td>
      <td style="border: 1px solid #1e293b; padding: 6px; text-align: center; vertical-align: middle; font-weight: bold;">4 JP</td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 8px; font-weight: 600; margin: auto;">Libur Akhir Tahun</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 8px; font-weight: 600; margin: auto;">Libur Akhir Tahun</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 8px; font-weight: 600; margin: auto;">Kegiatan Peserta didik</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 8px; font-weight: 600; margin: auto;">Kegiatan Peserta didik</div>
      </td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 8.5px; font-weight: bold; margin: auto;">ASTS</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 8.5px; font-weight: bold; margin: auto;">ASTS</div>
      </td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 7.5px; font-weight: 600; margin: auto;">Asesmen Sumatif Akhir Semester</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 7.5px; font-weight: 600; margin: auto;">Asesmen Sumatif Akhir Semester</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 7.5px; font-weight: 600; margin: auto;">Pengolahan nilai dan Penerimaan Raport</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 7.5px; font-weight: 600; margin: auto;">Libur Akhir Semester Gasal</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 7.5px; font-weight: 600; margin: auto;">Libur Akhir Semester Gasal</div>
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #1e293b; padding: 6px; vertical-align: top;">2. Peserta didik mampu mengaitkan makna dan simbol pada tari tradisi dalam bentuk karya seni pertunjukan</td>
      <td style="border: 1px solid #1e293b; padding: 6px; text-align: center; vertical-align: middle; font-weight: bold;">4 JP</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
    </tr>

    <!-- BAB 2 -->
    <tr>
      <td rowspan="2" style="border: 1px solid #1e293b; padding: 6px; font-weight: bold; vertical-align: top; background-color: #fafafa;">BAB 2 Apresiasi Tari Tradisi</td>
      <td style="border: 1px solid #1e293b; padding: 6px; vertical-align: top;">&bull; Peserta didik mampu membandingkan makna dan simbol dengan mengapresiasi tari tradisi serta membuat ide-ide baru ke dalam karyanya.</td>
      <td style="border: 1px solid #1e293b; padding: 6px; text-align: center; vertical-align: middle; font-weight: bold;">4 JP</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
    </tr>
    <tr>
      <td style="border: 1px solid #1e293b; padding: 6px; vertical-align: top;">&bull; Peserta didik mampu mengapresiasi makna dan simbol pada tari tradisi untuk membuat ide-ide baru ke dalam karya tari.</td>
      <td style="border: 1px solid #1e293b; padding: 6px; text-align: center; vertical-align: middle; font-weight: bold;">4 JP</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
    </tr>

    <!-- BAB 3 -->
    <tr>
      <td rowspan="2" style="border: 1px solid #1e293b; padding: 6px; font-weight: bold; vertical-align: top; background-color: #fafafa;">BAB 3 Rancangan karya Tari Tradisi individu dan kelompok</td>
      <td style="border: 1px solid #1e293b; padding: 6px; vertical-align: top;">&bull; Peserta didik mampu merancang hasil karya tari tradisi secara individu maupun berkelompok.</td>
      <td style="border: 1px solid #1e293b; padding: 6px; text-align: center; vertical-align: middle; font-weight: bold;">10 JP</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
    </tr>
    <tr>
      <td style="border: 1px solid #1e293b; padding: 6px; vertical-align: top;">&bull; Peserta didik mampu menunjukkan hasil karya tari tradisi secara individu maupun berkelompok</td>
      <td style="border: 1px solid #1e293b; padding: 6px; text-align: center; vertical-align: middle; font-weight: bold;">10 JP</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
    </tr>

    <!-- ROW TOTAL -->
    <tr style="background-color: #fef08a; font-weight: bold; border-top: 2px solid #1e293b;">
      <td colspan="2" style="border: 1px solid #1e293b; padding: 6px; text-align: center; font-weight: bold;">TOTAL</td>
      <td style="border: 1px solid #1e293b; padding: 6px; text-align: center; font-weight: bold;">36 JP</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
    </tr>
  </tbody>
</table>`,
  },
  {
    id: 'doc-modul-ajar-seni-tari',
    type: 'modul_ajar',
    title: 'Modul Ajar Seni Tari: Makna dan Simbol pada Tari Tradisi — Fase E / Kelas X',
    config: {
      docType: 'modul_ajar',
      mapel: 'Seni Tari',
      fase: 'E',
      kelas: 'X',
      semester: '1',
      tahunPelajaran: '2026/2027',
      topikMateri: 'Makna dan Simbol pada Tari Tradisi',
      alokasiWaktu: '2 x 40 menit',
      guruPengampu: 'Latifatun Nisa, S.Pd.',
      nipGuru: '199205142019032015',
      kepalaMadrasah: 'Bpk. H. Muhammad Asrori, M.Pd.',
      nipKepala: '197503142000031003',
      nilaiKBC: [
        'Cinta kepada Ilmu Pengetahuan',
        'Cinta kepada Diri dan Sesama',
        'Cinta kepada Tanah Air'
      ],
      modelPembelajaran: 'Game Based Learning, Inquiry-Based Learning & Cooperative Learning',
    },
    createdAt: '2026-09-21T09:30:00Z',
    createdBy: 'Latifatun Nisa, S.Pd.',
    contentMarkdown: `# MODUL AJAR SENI TARI
## MA NU 01 BANYUPUTIH — TAHUN PELAJARAN 2026/2027

---

## A. IDENTIFIKASI KESIAPAN PESERTA DIDIK
Sebelum memulai pembelajaran tentang Makna Tari, asesmen diagnostik akan dilakukan untuk mengidentifikasi kesiapan peserta didik, meliputi:
- **Pengetahuan Awal:**
  - Pengenalan terhadap beberapa jenis tari tradisional dan non-tradisional Indonesia.
  - Pemahaman dasar tentang elemen-elemen tari (gerak, musik, rias, busana, properti, tata panggung).
  - Pengalaman atau paparan terhadap pertunjukan tari (langsung maupun melalui media).
  - Kemampuan dasar dalam mengungkapkan pendapat atau mengapresiasi suatu karya seni.
- **Minat:**
  - Melalui puzzle makna dan simbol tari, guru dapat menggali minat peserta didik dengan meminta mereka menyusun potongan gambar tari tradisi hingga utuh, kemudian mendiskusikan makna simbol dari gambar tersebut.
  - Ketertarikan peserta didik dalam memainkan game Educaplay, di mana setiap kali berhenti di kotak tertentu mereka mendapat pertanyaan atau tantangan tentang makna gerak, busana, atau properti tari tradisi.
  - Minat peserta didik dalam game Memory Madness, yaitu mengingat dan mengelompokkan berbagai simbol tari tradisi ke dalam kategori yang tepat.
  - Minat peserta didik dalam memahami makna simbol tari akan tampak dari semangat mereka menyelesaikan puzzle, menjawab pertanyaan Educaplay, mengingat serta mengelompokkan simbol-simbol tari melalui game Memory Madness.
- **Latar Belakang:**
  - Latar belakang budaya peserta didik yang mungkin familiar dengan jenis tari tertentu.
  - Pengalaman berpartisipasi dalam ekstrakurikuler tari atau sanggar tari.
  - Tingkat kenyamanan peserta didik dalam berekspresi secara non-verbal atau menganalisis karya seni.
- **Kebutuhan Belajar:**
  - Peserta didik yang memiliki pengalaman menari dapat menjadi "pemandu sebaya" atau diberikan peran lebih dalam menganalisis makna dan simbol pada tari tradisi.
  - Peserta didik yang kurang familiar dengan tari tradisi akan lebih terbantu melalui Puzzle Simbol Tari, karena media visual ini memberi gambaran awal sebelum memahami maknanya.
  - Peserta didik dengan kecenderungan visual akan termotivasi saat melihat potongan gambar pada Puzzle atau melalui game Memory Madness.
  - Peserta didik dengan kecenderungan auditori akan lebih mudah belajar ketika berdiskusi menjawab pertanyaan pada game Educaplay Edukatif atau mendengar penjelasan teman tentang makna dan simbol pada tari tradisi.
  - Peserta didik dengan kecenderungan kinestetik akan menikmati permainan Memory Madness, karena mereka dilatih mengingat dan mengelompokkan simbol tari dengan bergerak aktif di dalam kelompok.
  - Peserta didik dengan kecenderungan analitis akan tertantang dalam permainan Memory Madness dan Educaplay Edukatif, khususnya ketika harus menjelaskan alasan pengelompokan simbol pada tari tradisi.

---

## C. KARAKTERISTIK MATERI PELAJARAN
Materi "Makna dan Simbol pada Tari Tradisi" memiliki karakteristik sebagai berikut:
- **Jenis Pengetahuan yang Akan Dicapai:**
  - **Faktual:** Mengenal berbagai jenis tari dan latar belakang budayanya, serta istilah-istilah terkait penafsiran makna tari (tekstual, kontekstual, simbolik).
  - **Konseptual:** Memahami bahwa tari merupakan bahasa non-verbal yang mengandung makna, serta memahami perbedaan antara penafsiran tekstual dan kontekstual.
  - **Prosedural:** Mampu mengamati gerak, ekspresi, rias, busana, dan musik tari; menganalisis keterkaitan elemen-elemen tersebut dengan makna; dan merumuskan penafsiran makna tari berdasarkan pengalaman diri dan informasi dari berbagai sumber.
  - **Metakognitif:** Merefleksikan bagaimana tari sebagai bagian dari kebudayaan mampu merefleksikan nilai-nilai, sejarah, dan pandangan hidup masyarakat, serta pentingnya apresiasi terhadap seni tari.
- **Relevansi dengan Kehidupan Nyata Peserta Didik:**
  - Seni tari adalah bagian integral dari kebudayaan Indonesia, sering dijumpai dalam acara adat, perayaan, atau tontonan.
  - Materi ini melatih kemampuan interpretasi, analisis simbol, dan pemahaman terhadap ekspresi non-verbal, keterampilan yang relevan dalam berbagai aspek kehidupan.
  - Mendorong apresiasi terhadap kekayaan budaya bangsa dan kearifan lokal yang terkandung dalam seni tari.
- **Tingkat Kesulitan:** Materi ini memiliki tingkat kesulitan menengah. Mengamati gerak secara detail membutuhkan fokus, dan menafsirkan makna memerlukan kemampuan berpikir simbolik serta analisis kontekstual yang mendalam. Penafsiran bersifat subjektif namun harus didukung oleh argumen yang logis.
- **Struktur Materi:** Materi terstruktur secara logis, dimulai dari pengenalan makna tari, kemudian pembahasan penafsiran berdasarkan kajian tekstual (analisis gerak, rias, busana, properti, musik) dan kontekstual (latar belakang sejarah, budaya, fungsi sosial tari), dilanjutkan dengan pengamatan langsung (jika memungkinkan), serta diakhiri dengan proses penulisan tafsir makna tari.
- **Integrasi Nilai dan Karakter:**
  - **Apresiasi Seni dan Budaya:** Menumbuhkan rasa cinta dan bangga terhadap seni tari sebagai warisan budaya bangsa.
  - **Penalaran Kritis:** Melatih kemampuan menganalisis, menginterpretasi, dan merumuskan argumen berdasarkan bukti visual/audio.
  - **Kreativitas:** Mendorong peserta didik untuk menginterpretasi makna secara personal dan menyajikannya secara menarik.
  - **Komunikasi:** Melatih kemampuan mengungkapkan penafsiran secara lisan maupun tulisan dengan jelas.
  - **Toleransi dan Keberagaman:** Menghargai berbagai bentuk tari dari berbagai daerah dan budaya.
  - **Mindfulness:** Melatih fokus dan kepekaan dalam mengamati detail gerak dan ekspresi.

---

## D. DIMENSI PROFIL LULUSAN PEMBELAJARAN
Dimensi profil lulusan yang akan dicapai dalam pembelajaran ini adalah:
- **Keimanan dan Ketakwaan terhadap Tuhan Yang Maha Esa dan Berakhlak Mulia:** Peserta didik mensyukuri anugerah keberagaman seni tari sebagai manifestasi kekayaan budaya ciptaan Tuhan, serta memahami nilai-nilai luhur yang terkandung di dalamnya.
- **Penalaran Kritis:** Peserta didik menganalisis simbol tari (gerak, musik, busana, properti) ketika menjawab pertanyaan dalam permainan Educaplay. Peserta didik menghubungkan simbol dengan konteks budaya serta mengemukakan alasan logis dari hasil penafsirannya.
- **Kreativitas:** Peserta didik mampu menyajikan penafsiran makna tari dengan cara yang inovatif, berdasarkan hasil pengelompokan simbol dalam permainan Memory Madness.
- **Kolaborasi:** Peserta didik mampu bekerja sama dalam kelompok untuk menganalisis dan mendiskusikan makna tari dari berbagai perspektif.
- **Komunikasi:** Peserta didik mampu menyampaikan hasil penafsiran makna tari secara lisan maupun tertulis dengan jelas, sistematis, dan persuasif.

---

## DESAIN PEMBELAJARAN

### A. CAPAIAN PEMBELAJARAN
Pada akhir Fase E, peserta didik mampu menginterpretasi, mengaitkan, membandingkan makna dan simbol tari tradisi sebagai pengetahuan dasar untuk merancang dan mengomposisikan karya tari tradisi secara individu ataupun kelompok sebagai wujud aktualisasi diri.

Capaian Pembelajaran setiap elemen adalah sebagai berikut:

| Elemen | Capaian Pembelajaran |
|---|---|
| **Mengalami (Experiencing)** | Peserta didik menginterpretasi dan mengaitkan makna dan simbol pada tari tradisi dalam bentuk karya seni pertunjukan. |
| **Merefleksikan (Reflecting)** | Peserta didik membandingkan makna dan simbol dengan mengapresiasi tari tradisi serta membuat ide-ide baru ke dalam karyanya. |
| **Berpikir dan Bekerja Artistik (Thinking and Working Artistically)** | Peserta didik merancang dan menunjukkan hasil karya tari tradisi secara individu maupun berkelompok. |
| **Menciptakan (Creating)** | Peserta didik membuat dan mengomposisikan karya tari kreasi berdasarkan makna dan simbol dari tari tradisi dalam bentuk karya seni pertunjukan. |
| **Berdampak (Impacting)** | Peserta didik mengaktualisasikan diri melalui pertunjukan tari. |

---

### B. LINTAS DISIPLIN ILMU
- **Sosiologi / Antropologi:** Memahami fungsi tari dalam masyarakat, adat istiadat, dan kaitannya dengan budaya lokal.
- **Sejarah:** Memahami perkembangan dan perubahan makna tari sepanjang sejarah.
- **Seni Musik:** Memahami peran musik sebagai elemen penting dalam tari dan bagaimana musik membangun suasana dan makna.
- **Bahasa Indonesia:** Kemampuan mendeskripsikan, menganalisis, dan menuliskan interpretasi makna tari.
- **Pendidikan Kewarganegaraan:** Mengembangkan rasa bangga terhadap seni tari sebagai bagian dari identitas bangsa.
- **Teknologi Informasi dan Komunikasi (TIK):** Pemanfaatan internet untuk mencari video tari, aplikasi editing video sederhana untuk presentasi, dan media sosial untuk eksplorasi.

---

### C. TUJUAN PEMBELAJARAN
- **Pertemuan 1: Makna dan Simbol Tari Tradisi**
  - Melalui penyusunan potongan puzzle gambar tari, peserta didik mampu mendefinisikan seni tari dengan kata-kata sendiri.
  - Setelah menyusun puzzle hingga membentuk gambar tari utuh, peserta didik mampu mengidentifikasi dan menyebutkan makna, simbol, dan fungsi tari tradisi.
  - Peserta didik mampu memberikan contoh konkret dari setiap makna dan simbol pada tari tradisi berdasarkan hasil diskusi setelah menyelesaikan puzzle.
- **Pertemuan 2: Makna Pada Tari Tradisi**
  - Melalui pertanyaan yang muncul di kotak Educaplay, peserta didik mampu menganalisis makna gerak tari, musik pengiring, kostum, tata rias, dan properti dengan tepat.
  - Setelah menjawab tantangan dalam permainan, peserta didik mampu menginterpretasikan pesan atau cerita keseluruhan dalam tari tradisi secara logis.
  - Peserta didik mampu memaparkan jawaban atau hasil diskusi secara singkat dan meyakinkan, serta menghubungkan makna tari dengan konteks budaya yang melatarbelakanginya.
- **Pertemuan 3: Simbol Pada Tari Tradisi**
  - Peserta didik mampu mengidentifikasi dan mengingat simbol-simbol tari tradisi melalui permainan Memory Madness.
  - Peserta didik mampu mencocokkan simbol tari dengan makna yang tepat secara mandiri maupun berkelompok.
  - Peserta didik mampu menginterpretasikan pesan atau makna tari tradisi berdasarkan hasil pencocokan simbol dalam permainan.
  - Peserta didik mampu menyajikan hasil diskusi secara singkat dengan percaya diri, serta mengaitkan simbol tari dengan nilai budaya yang terkandung.

---

### D. TOPIK PEMBELAJARAN KONTEKSTUAL
- Tari-tarian tradisional daerah asal peserta didik (misalnya, tari Saman, tari Jaipong, tari Reog).
- Tari pergaulan atau tari modern yang populer di media sosial.
- Tari yang digunakan dalam upacara adat atau keagamaan (misalnya, tari penyambutan, tari ritual).
- Tari sebagai media protes sosial atau penyampaian pesan.
- Tari dari film, drama musikal, atau video musik.
- Tari dalam konteks olahraga (senam irama, cheerleading).
- Makna warna kostum tari atau bentuk properti tertentu (misalnya, topeng, kipas, keris).

---

### E. KERANGKA PEMBELAJARAN

#### Praktik Pedagogik (Model, Strategi, Metode):
- **Model Pembelajaran:** Game Based Learning, Inquiry-Based Learning (untuk menelusuri makna tari) dan Cooperative Learning.
- **Strategi Pembelajaran:** Visual Thinking (menggunakan puzzle simbol tari tradisi, kartu memory madness, dan ilustrasi visual lain untuk memancing pemikiran).
- **Metode Pembelajaran:** Diskusi, Collaborative Game Play, & Gamification learning.

#### Kemitraan Pembelajaran:
- **Lingkungan Sekolah:** Guru mata pelajaran lain (misalnya, Guru Bahasa Indonesia untuk mendeskripsikan makna, Guru Sejarah untuk konteks tari tradisional), Pembina ekstrakurikuler tari, pengelola perpustakaan sekolah.
- **Lingkungan Luar Sekolah:** Orang tua/wali (sebagai sumber informasi tari tradisional keluarga/daerah), sanggar tari lokal (jika ada kesempatan kunjungan/narasumber), seniman tari/koreografer lokal.
- **Masyarakat:** Komunitas adat (jika ada tari ritual/upacara), penari profesional, penyelenggara festival seni tari.

#### Lingkungan Belajar:
- **Ruang Fisik:** Kelas yang memiliki proyektor/layar besar untuk menayangkan video tari. Ruang yang cukup luas untuk aktivitas eksplorasi gerak sederhana jika diperlukan.
- **Ruang Virtual:** Pemanfaatan Google Classroom untuk berbagi tautan video tari, materi, tugas, dan forum diskusi daring. Penggunaan platform video seperti YouTube untuk eksplorasi tari dari berbagai belahan dunia.
- **Budaya Belajar (Deep Learning):**
  - **Mindful Learning:** Peserta didik diajak bermain Memory Madness secara perlahan untuk mengingat simbol-simbol tari tradisi (gerak, musik, busana, properti) tanpa langsung diberi makna. Setelah permainan, peserta didik merefleksikan simbol mana yang paling menarik perhatian dan apa perasaan yang muncul saat melihat atau mengingat simbol tersebut.
  - **Meaningful Learning:** Mengaitkan setiap elemen tari dengan pengalaman emosional atau cerita yang ingin disampaikan, mendorong peserta didik untuk "merasakan" makna tari, bukan hanya menghafalnya. Menggunakan tari-tarian dari daerah asal peserta didik sebagai contoh utama.
  - **Joyful Learning:** Proses memahami makna tari dikemas dalam permainan yang menyenangkan (puzzle untuk menyusun simbol, Educaplay untuk menjawab pertanyaan, memory madness untuk mengingat dan mengelompokkan). Peserta didik aktif bergerak, berpikir, dan berinteraksi dalam suasana kompetitif sekaligus kolaboratif.

#### Pemanfaatan Digital:
- **Perpustakaan Digital:** Mencari artikel, jurnal, atau dokumentasi tentang tari tradisional/modern beserta maknanya dari sumber terpercaya (situs kebudayaan, ensiklopedia daring).
- **Forum Diskusi Daring:** Google Classroom untuk sesi tanya jawab, berbagi tautan video tari yang menarik, dan saling memberikan komentar atas interpretasi makna tari.
- **Penilaian Daring:** Kuis formatif menggunakan Educaplay untuk menguji pemahaman makna dan simbol pada tari tradisi.
- **Aplikasi Pendukung:** Platform video (YouTube, TikTok) untuk mencari referensi tari.

---

### F. LANGKAH-LANGKAH PEMBELAJARAN BERDIFERENSI

#### Pertemuan 1: Makna dan Simbol pada Tari Tradisi (Fokus: Mindful Learning, Meaningful Learning)

| Kegiatan | Alokasi Waktu |
|---|---|
| **1. KEGIATAN PENDAHULUAN**<br><br>**Guru :**<br>**Orientasi**<br>a. Guru memberi salam.<br>b. Peserta didik memimpin doa untuk memulai pembelajaran.<br>c. Guru memeriksa kehadiran peserta didik sebagai sikap disiplin.<br>d. Guru memberikan motivasi pada peserta didik untuk bersemangat mengikuti pelajaran yang sedang berlangsung.<br>e. Guru mengajak siswa untuk melakukan ice breaking.<br><br>**Apersepsi & Meaningful Learning**<br>a. Guru mengingatkan kembali materi sebelumnya dengan memberikan pertanyaan.<br>b. Peserta didik menjawab pertanyaan mengenai materi sebelumnya.<br><br>**Motivasi & Joyful Learning**<br>a. Peserta didik menyimak gambaran tentang Makna dan Simbol Pada Tari Tradisi.<br>b. Guru menjelaskan model dan metode pembelajaran yang akan digunakan.<br>c. Guru menyampaikan tujuan pembelajaran yang akan dicapai pada pertemuan ini.<br>d. Guru menyampaikan secara jelas materi pembelajaran yang akan dipelajari dalam pertemuan.<br>e. Guru menjelaskan mekanisme kegiatan pembelajaran. | 30 Menit |
| **2. KEGIATAN INTI**<br><br>**Eksplorasi (Memahami - Diferensiasi Konten):**<br>a. Guru menyampaikan materi pembelajaran melalui media salindia presentasi.<br>b. Guru memberikan pertanyaan pemantik mengenai materi pembelajaran:<br>• Apa saja yang kalian lihat pada gambar tari tersebut?<br>• Apa nama tarian tersebut?<br>• Asal tarian itu dari mana?<br><br>**Identifikasi & Klasifikasi (Mengaplikasi - Diferensiasi Proses & Produk):**<br>a. Peserta didik bermain permainan edukatif secara berkelompok.<br>b. Guru menjelaskan konsep, aturan, dan langkah-langkah dalam permainan edukatif yang akan dilaksanakan.<br>c. Peserta didik dibagi dalam kelompok kecil dan masing-masing kelompok menyusun puzzle gambar tari tradisi.<br>d. Guru berkeliling untuk mendampingi, terutama jika ada kelompok yang kesulitan mengenali bagian potongan gambar tertentu.<br>e. Setelah puzzle selesai, peserta didik menuliskan identifikasi: Nama tari, Asal tariannya, Simbol yang terlihat, Makna dari simbol, Fungsi tari.<br>• Guru memfasilitasi presentasi hasil tiap kelompok, membandingkan perbedaan makna yang mereka temukan.<br>f. Peserta didik diberi kesempatan mengajukan pertanyaan atau memberikan interpretasi tambahan terkait gambar tari yang telah mereka susun.<br><br>**Diskusi & Konfirmasi (Merefleksi):**<br>a. Refleksi & Umpan Balik: Guru mengajak peserta didik untuk menyimpulkan materi pembelajaran yang telah dipelajari secara bersama-sama, guna memperkuat pemahaman.<br>b. Penyimpulan: Guru bersama peserta didik merumuskan kembali definisi makna dan simbol tari tradisi berdasarkan hasil eksplorasi puzzle.<br>c. Perencanaan Pembelajaran Selanjutnya: Guru menyampaikan bahwa pada pertemuan berikutnya, peserta didik akan membahas lebih dalam tentang makna simbol berdasarkan unsur utama dan unsur pendukung. | 40 Menit |
| **3. KEGIATAN PENUTUP**<br><br>**Guru:**<br>1. Guru menginformasikan tentang materi untuk pertemuan berikutnya.<br>2. Peserta didik memimpin doa sebelum mengakhiri pembelajaran.<br>3. Guru memberikan salam. | 10 Menit |

#### Pertemuan 2: Makna pada Tari Tradisi (Fokus: Mindful Learning, Meaningful Learning)

| Kegiatan | Alokasi Waktu |
|---|---|
| **1. KEGIATAN PENDAHULUAN**<br><br>**Guru :**<br>**Orientasi**<br>a. Guru memberi salam.<br>b. Peserta didik memimpin doa untuk memulai pembelajaran.<br>c. Guru memeriksa kehadiran peserta didik sebagai sikap disiplin.<br>d. Guru memberikan motivasi pada peserta didik untuk bersemangat mengikuti pelajaran yang sedang berlangsung.<br>e. Guru mengajak siswa untuk melakukan ice breaking.<br><br>**Apersepsi & Meaningful Learning**<br>a. Guru mengingatkan kembali materi sebelumnya dengan memberikan pertanyaan.<br>b. Peserta didik menjawab pertanyaan mengenai materi sebelumnya.<br><br>**Motivasi & Joyful Learning**<br>a. Peserta didik menyimak gambaran tentang Makna dan Simbol Pada Tari Tradisi.<br>b. Guru menjelaskan model dan metode pembelajaran yang akan digunakan.<br>c. Guru menyampaikan tujuan pembelajaran yang akan dicapai pada pertemuan ini.<br>d. Guru menyampaikan secara jelas materi pembelajaran yang akan dipelajari dalam pertemuan.<br>e. Guru menjelaskan mekanisme kegiatan pembelajaran. | 30 Menit |
| **2. KEGIATAN INTI**<br><br>**Eksplorasi (Memahami - Diferensiasi Konten):**<br>a. Guru menyampaikan materi pembelajaran melalui media salindia presentasi.<br>b. Guru memberikan pertanyaan pemantik mengenai materi pembelajaran:<br>• Apa yang kalian ketahui tentang gerak tari?<br>• Apakah warna busana dalam tari punya makna tertentu?<br><br>**Identifikasi & Klasifikasi (Mengaplikasi - Diferensiasi Proses & Produk):**<br>a. Guru memperlihatkan papan Educaplay digital di Educaplay dan menjelaskan aturan permainan (setiap kotak berisi pertanyaan seputar makna & simbol tari tradisi).<br>b. Peserta didik memainkan permainan Educaplay secara individu dengan menggunakan satu buah handphone. Guru memantau jalannya permainan, memberi arahan jika ada kelompok yang kesulitan memahami soal.<br>c. Peserta didik yang berhasil menjawab pertanyaan dapat naik tangga; jika salah, mereka turun sesuai aturan.<br>d. Guru memfasilitasi diskusi kelas untuk membandingkan jawaban dan memperdalam pemahaman makna dan simbol pada tari tradisi.<br><br>**Diskusi & Konfirmasi (Merefleksi):**<br>a. Refleksi & Umpan Balik: Guru mengajak peserta didik merefleksikan pengalaman bermain Educaplay digital—simbol mana yang paling sering muncul, pertanyaan mana yang paling menantang, dan pengetahuan baru apa yang mereka peroleh.<br>b. Penyimpulan: Guru bersama peserta didik menyimpulkan konsep makna dan simbol pada tari tradisi berdasarkan jawaban dari pertanyaan-pertanyaan dalam permainan.<br>c. Perencanaan Pembelajaran Selanjutnya: Guru menyampaikan topik lanjutan, yaitu simbol pada tari tradisi. | 40 Menit |
| **3. KEGIATAN PENUTUP**<br><br>**Guru:**<br>a. Guru menginformasikan tentang materi untuk pertemuan berikutnya.<br>b. Peserta didik memimpin doa sebelum mengakhiri pembelajaran.<br>c. Guru memberikan salam. | 10 Menit |

#### Pertemuan 3: Simbol pada Tari Tradisi (Fokus: Mindful Learning, Meaningful Learning)

| Kegiatan | Alokasi Waktu |
|---|---|
| **1. KEGIATAN PENDAHULUAN**<br><br>**Guru :**<br>**Orientasi**<br>a. Guru memberi salam.<br>b. Peserta didik memimpin doa untuk memulai pembelajaran.<br>c. Guru memeriksa kehadiran peserta didik sebagai sikap disiplin.<br>d. Guru memberikan motivasi pada peserta didik untuk bersemangat mengikuti pelajaran yang sedang berlangsung.<br>e. Guru mengajak siswa untuk melakukan ice breaking.<br><br>**Apersepsi & Meaningful Learning**<br>a. Guru mengingatkan kembali materi sebelumnya dengan memberikan pertanyaan.<br>b. Peserta didik menjawab pertanyaan mengenai materi sebelumnya.<br><br>**Motivasi & Joyful Learning**<br>a. Peserta didik menyimak gambaran tentang Makna dan Simbol Pada Tari Tradisi.<br>b. Guru menjelaskan model dan metode pembelajaran yang akan digunakan.<br>c. Guru menyampaikan tujuan pembelajaran yang akan dicapai pada pertemuan ini.<br>d. Guru menyampaikan secara jelas materi pembelajaran yang akan dipelajari dalam pertemuan.<br>e. Guru menjelaskan mekanisme kegiatan pembelajaran. | 30 Menit |
| **2. KEGIATAN INTI**<br><br>**Eksplorasi (Memahami - Diferensiasi Konten):**<br>a. Guru meminta peserta didik membuka LKS pada materi Simbol pada Tari Tradisi.<br>b. Guru memberikan waktu 5–7 menit untuk membaca dan mengamati bagian simbol-simbol (gerak, busana, properti, musik, dan tata rias) dalam tari tradisi.<br>c. Setelah itu, LKS ditutup. Guru memberi pertanyaan pemantik:<br>• Simbol apa yang kalian ingat dari bacaan tadi?<br>• Menurut kalian, apa makna dari simbol tersebut?<br><br>**Identifikasi & Klasifikasi (Mengaplikasi - Diferensiasi Proses & Produk):**<br>a. Guru menjelaskan aturan permainan Memory Madness berbasis bacaan.<br>b. Peserta didik harus mengingat isi LKS dan menjawab pertanyaan secara cepat.<br>c. Peserta didik dibagi dalam kelompok kecil.<br>d. Guru berkeliling untuk memastikan peserta didik sudah menutup buku LKS-nya.<br>e. Aturan: Siswa pertama dari kelompok maju ke papan, menuliskan 1 simbol tari yang diingat dari materi LKS. Siswa kedua melanjutkan, begitu seterusnya sampai semua siswa dalam kelompok mendapat giliran.<br><br>**Diskusi & Konfirmasi (Merefleksi):**<br>a. Refleksi & Umpan Balik: Peserta didik menceritakan simbol apa yang paling mudah atau sulit diingat, serta makna apa yang baru mereka temukan.<br>b. Penyimpulan: Guru bersama peserta didik menyimpulkan kembali pengertian makna dan simbol tari tradisi serta contoh-contohnya.<br>c. Perencanaan Pembelajaran Selanjutnya: Guru memberi arahan bahwa pada pertemuan berikutnya akan membahas Bab 2 "Apresiasi Tari Tradisi". | 40 Menit |
| **3. KEGIATAN PENUTUP**<br><br>**Guru:**<br>a. Guru menginformasikan tentang materi untuk pertemuan berikutnya.<br>b. Peserta didik memimpin doa sebelum mengakhiri pembelajaran.<br>c. Guru memberikan salam. | 10 Menit |

---

### G. ASESMEN PEMBELAJARAN

#### 1. ASESMEN AWAL PEMBELAJARAN
**Tujuan:** Mengidentifikasi pengetahuan awal, minat, dan kesiapan peserta didik dalam memahami makna dan simbol tari tradisi.  
**Format & Contoh:**
- **Tes Lisan Singkat:**
  - *"Apa yang kalian ketahui tentang simbol dalam tari tradisi?"*
  - *"Sebutkan contoh properti tari dan maknanya!"*
- **Kuesioner Minat (Google Form / lembar sederhana):**
  - Pengalaman menonton tari tradisi, keterlibatan di sanggar, atau minat pada budaya daerah.
- **Observasi:**
  - Guru mengamati reaksi siswa saat menonton video tari tradisi (apakah antusias, penasaran, atau bingung).

#### 2. ASESMEN PROSES PEMBELAJARAN
**Tujuan:** Memantau pemahaman peserta didik melalui aktivitas game.  
**Format & Contoh:**
- **a. Observasi Kinerja saat Game:**
  - **Puzzle Tari Tradisi:** Seberapa cepat kelompok menyusun potongan gambar tari dan mampu menjelaskan makna simbol di gambar tersebut.
  - **Educaplay:** Keaktifan siswa menjawab pertanyaan simbol/makna saat maju dalam permainan.
  - **Memory Madness:** Kemampuan kelompok mengingat dan menuliskan urutan simbol–makna secara bergiliran di papan tulis.
  - **Kriteria:** partisipasi, kerja sama, ketepatan jawaban, daya ingat.
- **b. Penilaian Produk Game:**
  - Puzzle selesai → makna simbol dijelaskan.
  - Educaplay → skor jawaban benar tiap langkah.
  - Memory Madness → urutan simbol-makna yang benar tanpa terputus.
- **c. Jurnal Refleksi Singkat:**
  - *"Simbol apa yang paling mudah kalian ingat? Mengapa?"*
  - *"Bagaimana kerja kelompokmu saat menyelesaikan game tadi?"*

#### 3. ASESMEN AKHIR PEMBELAJARAN
- **a. Puzzle:** Presentasi hasil puzzle + penjelasan simbol.
- **b. Educaplay:** Rekap skor permainan sebagai indikator penguasaan materi.
- **c. Memory Madness:** Kelompok membuat rangkuman simbol–makna yang berhasil diingat, ditulis di papan tulis.`,
  },
  {
    id: 'doc-modul-ajar-01',
    type: 'modul_ajar',
    title: 'Modul Ajar Fiqih Thaharah Berbasis Deep Learning & KBC — Kelas X',
    config: {
      docType: 'modul_ajar',
      mapel: 'Fiqih',
      fase: 'E',
      kelas: 'X',
      semester: '1',
      tahunPelajaran: '2025/2026',
      topikMateri: 'Konsep Thaharah dan Kebersihan Lahir-Batin dalam Bingkai Kasih Sayang Allah',
      alokasiWaktu: '4 JP (2 Pertemuan @ 45 Menit)',
      guruPengampu: 'Ibu Siti Fatimah, S.Ag.',
      nipGuru: '198208152009122004',
      kepalaMadrasah: 'Bpk. H. Muhammad Asrori, M.Pd.',
      nipKepala: '197503142000031003',
      nilaiKBC: [
        'Cinta kepada Allah dan Rasul-Nya',
        'Cinta kepada Ilmu Pengetahuan',
        'Cinta kepada Lingkungan (Alam)'
      ],
      modelPembelajaran: 'Understanding by Design (UbD) & Problem Based Learning (PBL)',
    },
    createdAt: '2026-09-21T08:15:00Z',
    createdBy: 'Ibu Siti Fatimah, S.Ag.',
    contentMarkdown: `# MODUL AJAR KURIKULUM MERDEKA MADRASAH
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN 2025/2026

### I. INFORMASI UMUM
- **Nama Penyusun:** Ibu Siti Fatimah, S.Ag.
- **Satuan Pendidikan:** MA NU 01 Banyuputih Batang
- **Fase / Kelas / Semester:** E / Kelas X / Gasal
- **Alokasi Waktu:** 4 JP (2 Pertemuan x 45 Menit)
- **Kompetensi Awal:** Peserta didik telah memahami rukun Islam dan praktik wudhu dasar.
- **Profil Pelajar Pancasila & Rahmatan lil Alamin:** Beriman, Bertakwa kepada Tuhan YME, Berakhlak Mulia, Gotong Royong, Berkeadaban (Ta'addub), Keteladanan (Qudwah), dan Toleransi (Tasamuh).
- **Sarana & Prasarana:** Kitab Fathul Qarib, LCD Proyektor, Kran air wudhu madrasah, Lembar Kerja Siswa.

### II. KOMPONEN INTI
#### A. Capaian Pembelajaran (Fase E)
Peserta didik mampu menganalisis tata cara bersuci dari hadas dan najis berdasarkan dalil Al-Qur'an, hadits shahih, dan pandangan fuqaha mazhab Syafi'i, serta membiasakan pola hidup bersih dan suci dalam kehidupan sehari-hari sebagai perwujudan cinta kepada Allah SWT.

#### B. Pendekatan Deep Learning & Integrasi Kurikulum Berbasis Cinta (KBC)
- **Pemahaman Bermakna (Deep Learning):**
  Bersuci (thaharah) bukan sekadar rutinitas basuhan fisik mekanis, melainkan transformasi batiniah yang menyucikan jiwa dari egoisme, dendam, dan kotoran rohani agar layak menghadap Sang Maha Kasih.
- **Pertanyaan Pemantik KBC:**
  1. Mengapa Allah SWT mencintai hamba-Nya yang gemar menyucikan diri (*at-tawwabin wa al-mutathahhirin*)?
  2. Bagaimana adab kita menghemat air wudhu sebagai bentuk kasih sayang dan tanggung jawab terhadap kelestarian alam ciptaan Allah?

#### C. Langkah-Langkah Kegiatan Pembelajaran
##### Pertemuan 1: Eksplorasi Konseptual Thaharah (2 x 45 Menit)
1. **Kegiatan Pendahuluan (15 Menit):**
   - Guru membuka dengan salam santun, membaca Asmaul Husna bersama, dan menyapa setiap siswa dengan senyuman tulus (Prinsip KBC: Welcoming with Love).
   - Apersepsi: Guru mengaitkan kebiasaan wudhu siswa sebelum berangkat sekolah dengan pancaran cahaya wajah di hari kiamat.
   - Menyampaikan tujuan pembelajaran dan kontrak belajar yang menyenangkan.

2. **Kegiatan Inti — Sintaks Problem-Based Learning (60 Menit):**
   - **Orientasi Masalah:** Guru menayangkan video studi kasus keterbatasan air bersih di daerah bencana dan air keruh bercampur lumpur. Siswa diajak berempati.
   - **Organisasi Belajar:** Siswa dibagi ke dalam 4 kelompok heterogen (Diferensiasi Minat & Gaya Belajar).
   - **Penyelidikan:** Siswa mengkaji teks kitab Fathul Qarib bab Thaharah, mengidentifikasi perbedaan air suci-menyucikan, air musta'mal, dan air mutanajjis.
   - **Pengembangan Hasil:** Setiap kelompok menyusun peta konsep hukum air dan merumuskan sikap adab terhadap sumber daya air.
   - **Refleksi & Evaluasi Kasih Sayang:** Guru membimbing siswa menyimpulkan bahwa fiqih hadir untuk mempermudah hidup manusia (Taisir fi ad-Din), bukan menyulitkan.

3. **Kegiatan Penutup (15 Menit):**
   - Siswa merefleksikan hikmah thaharah bagi ketenteraman hati.
   - Guru memberikan umpan balik afektif dan apresiasi kepada seluruh kelompok.
   - Doa penutup majelis (Kaffaratul Majelis) dan mushafahah penuh adab.

#### D. Diferensiasi Pembelajaran
- **Kelompok Reguler:** Menganalisis klasifikasi air dan hukum najis pada lembar kerja standar.
- **Kelompok Pengayaan:** Menelaah perbandingan mazhab mengenai batas dua qullah dalam liter modern dan mengkaji fatwa Bahtsul Masail NU.
- **Kelompok Remedial:** Bimbingan terbimbing guru mengenai urutan fardhu wudhu dan praktik langsung di tempat wudhu madrasah.

#### E. Asesmen Pembelajaran
1. **Asesmen Formatif (Awal):** Pertanyaan lisan diagnostik seputar kebiasaan wudhu harian.
2. **Asesmen Formatif (Proses):** Observasi lembar adab diskusi, keaktifan gotong royong, dan kesantunan berbahasa.
3. **Asesmen Sumatif:** Soal tes objektif (pilihan ganda terintegrasi KaTeX/Arab) dan unjuk kerja praktik wudhu khusyu'.`,
  },
];
