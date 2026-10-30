/** サイト全体で使うプロフィール情報。ここを直せば各所に反映されます。 */
export const profile = {
  siteName: 'okmt.dev',
  url: 'https://okmt.dev',
  name: '中島 祐樹',
  nameEn: 'Yuki Nakajima',
  formerName: '岡本 祐樹',
  formerNameEn: 'Yuki Okamoto',
  title: 'Product Manager',
  company: '株式会社RevComm',
  companyEn: 'RevComm Inc.',
  companyUrl: 'https://www.revcomm.co.jp/',
  productUrl: 'https://miitel.com/',
  pdmSince: '2025.07',
  birthDate: '1996-05-07',
  birthDateLabel: '1996年5月7日',
  birthPlace: '兵庫県',
  birthPlaceEn: 'Hyogo, Japan',
  location: '神奈川県横浜市',
  locationEn: 'Yokohama, Japan',
  education: '大阪大学大学院 情報科学研究科 修了（Linux / FileSystem / IoT / Security）・神戸大学 工学部 情報知能工学科 卒',
  educationEn: 'M.Sc., Osaka University (Linux, file systems, IoT, security) · B.Eng., Kobe University',
  languages: '日本語 / 英語',
  languagesEn: 'Japanese / English',
  values: '地道に磨き、大きな成果を出すこと',
  valuesEn: 'Linear craft, exponential impact.',
  certifications: ['IoTエキスパート', 'G検定', 'データサイエンティスト検定', '2級ウェブデザイン技能士', 'カラーコーディネーター検定', 'FP', '簿記', 'SEO検定', 'マーケティング検定', '応用情報技術者', 'LPIC'],
  certificationsEn: 'IoT Expert · JDLA Deep Learning for GENERAL · Data Scientist Certification · Web Design Skills Test Grade 2 · Color Coordinator · Financial Planner · Bookkeeping · SEO · Marketing · Applied Information Technology Engineer · LPIC, among others',
  /** 本人の写真。基本情報の右上。 */
  portrait: { src: '/images/yuki.jpg', alt: '中島祐樹。ビールを前にしたところ', caption: '学生時代 / I love beer.' },
  patents: [
    { no: '特許第7335299号', title: '情報処理装置、情報処理方法および情報処理プログラム' },
    { no: '特許第7248757号', title: '情報処理装置、情報処理方法および情報処理プログラム' },
  ],
  catch: [
    { text: 'コードを書いていた手で、', br: true },
    { text: 'プロダクトの意思決定', strong: true },
    { text: 'をする。' },
  ],
  catchEn: 'Product decisions, made by the hands that used to write the code.',
  description:
    '中島 祐樹（旧姓：岡本）のポートフォリオ。エンジニア出身のプロダクトマネージャー。株式会社RevCommで音声AI「MiiTel」のロードマップと公開APIを担当。',
  descriptionEn:
    'Portfolio of Yuki Nakajima (formerly Okamoto), an engineer-turned-product manager leading the roadmap and public API of MiiTel, a voice AI SaaS by RevComm.',
  /** 愛犬の写真。public/images/ に置いてパスを差し替えてください。 */
  dogPhotos: [
    { src: '/images/pal2.jpg', alt: '白いふわふわの愛犬がベッドの中でこちらを見ている', caption: '犬に服着せるな / My friend. in the usual spot.' },
    { src: '/images/pal1.jpg', alt: '白いふわふわの愛犬のアップ', caption: 'じっとこちらを見ている。 / Looking back at me.' },
  ],
};

export const links = [
  { label: 'YOUTRUST', href: 'https://youtrust.jp/users/yukinakajima' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/yuki-nakajima-1a2691315/' },
  { label: 'Wantedly', href: 'https://www.wantedly.com/id/yuki_nakajima_dev' },
  { label: 'GitHub', href: 'https://github.com/okmtdev' },
  { label: 'note（在籍エントリ）', href: 'https://note.com/revcomm_miitel/n/n3b54b9a66419' },
];
