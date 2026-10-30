/**
 * キャリアを changelog として書く。新しいものを上に。
 * date は表示文字列そのまま。
 */
export type Bullet = string | { text: string; href: string; label: string };
export type CareerEntry = {
  version: string;
  date: string;
  org: string;
  orgEn: string;
  title: string;
  titleEn: string;
  type: 'major' | 'minor' | 'patch' | 'next';
  bullets: Bullet[];
  summaryEn: string;
  tags?: string[];
  /** 背景に薄く置くヒーローの図。view と flavor は src/scripts/fig.ts 参照 */
  fig?: { view: 'mail' | 'biz' | 'wave' | 'fs'; flavor?: 'dev' | 'pm' };
};

export const career: CareerEntry[] = [
  {
    version: 'v3.0.0+',
    date: 'Next',
    org: '未定 / 構想中',
    orgEn: 'Not yet decided',
    title: '何を目指すか',
    titleEn: 'What is next...?',
    type: 'next',
    bullets: [
      'プロダクトを通じて、SaaS 事業の成長を力強く牽引できる存在になる',
      'IoT のように、モノと情報が交わる領域で、自らの手で作りたいものはまだ尽きない',
    ],
    summaryEn:
      'To become someone who drives SaaS growth through the product itself. Where things and information meet, as in IoT, there is still plenty I want to build with my own hands. Nothing here is fixed; this entry is rewritten as I go.',
    tags: ['Unreleased', 'Subject to change'],
  },
  {
    version: 'v3.0.0',
    fig: { view: 'wave', flavor: 'pm' },
    date: '2025.07 —',
    org: '株式会社RevComm',
    orgEn: 'RevComm Inc.',
    title: 'プロダクトマネージャー',
    titleEn: 'Product Manager',
    type: 'major',
    bullets: [
      '音声AI SaaS「MiiTel」の MiiTel Phone / Phone Analytics / 外部連携担当のプロダクトマネージャーとして、中長期方針とロードマップを策定。また、「MiiTel API（β）」の立ち上げPdMとして、海外チームと要件定義からリリースまでを推進',
      '現状を整理して方針を練り、ボードメンバーに対して開発優先度・リソース配分の意思決定を促す',
    ],
    summaryEn:
      'Product manager for MiiTel Phone, Phone Analytics and integrations, owning the mid-to-long-term roadmap. Launched MiiTel API (beta) with an overseas engineering team, from requirements to release.',
    tags: ['Roadmap', 'Public API', 'Integrations', 'GenAI'],
  },
  {
    version: 'v2.0.0',
    fig: { view: 'wave', flavor: 'dev' },
    date: '2023.08 — 2025.06',
    org: '株式会社RevComm',
    orgEn: 'RevComm Inc.',
    title: 'ソフトウェアエンジニア / プロジェクトリーダー',
    titleEn: 'Software Engineer / Project Lead',
    type: 'major',
    bullets: [
      '基盤刷新プロジェクトのリーダーとして移行計画・ロードマップ・API 設計・他チーム調整を主導',
      { text: 'AWS Startup Multi-Country GenAI GameDay（2024.08）にチームで出場し、国内 3 位・世界 5 位', href: 'https://note.com/revcomm_miitel/n/n1cc0ec3058b4', label: 'note' },
    ],
    summaryEn:
      'Led the platform re-architecture project end to end. Placed 5th worldwide (3rd in Japan) at the AWS GenAI GameDay in 2024.',
    tags: ['Python', 'FastAPI', 'AWS', 'EKS', 'Terraform'],
  },
  {
    version: 'v1.1.0',
    fig: { view: 'biz' },
    date: '2022.05 — 2023.07',
    org: 'SIer 分野で起業',
    orgEn: 'Founder, SI company',
    title: '代表（創業）',
    titleEn: 'Founder & CEO',
    type: 'minor',
    bullets: [
      '社員 4 名、アルバイト含め 20 名弱の会社を経営。顧客折衝、採用、マネジメント、決算までを経験',
      '事業拡大を目前に解散を決断。労働集約型モデルからプロダクト集約型へキャリアの舵を切る',
    ],
    summaryEn:
      'Founded and ran an SI company of ~20 people, from sales and hiring to closing the books. Chose to dissolve it and move to product-led SaaS.',
    tags: ['Management', 'Hiring', 'Finance'],
  },
  {
    version: 'v1.0.0',
    fig: { view: 'mail' },
    date: '2021.04 — 2023.06',
    org: 'ヤフー株式会社（現 LINEヤフー）',
    orgEn: 'Yahoo Japan (now LY Corporation)',
    title: 'バックエンドエンジニア',
    titleEn: 'Backend Engineer',
    type: 'major',
    bullets: [
      '広告メール配信システムの開発・運用。15 年以上稼働するレガシーコードの保守とモダンアーキテクチャへのリプレース',
      'DDD とクリーンアーキテクチャによる Web API 開発。Development Relations を兼務',
      '社内ハッカソンで最優秀賞を受賞',
    ],
    summaryEn:
      'Maintained and replaced a 15-year-old email marketing system; built Web APIs with DDD and clean architecture. Won first prize at the in-house hackathon.',
    tags: ['Java', 'DDD', 'Clean Architecture'],
  },
  {
    version: 'v0.2.0',
    fig: { view: 'fs' },
    date: '2019.04 — 2021.03',
    org: '大阪大学大学院 情報科学研究科 情報ネットワーク学専攻',
    orgEn: 'Osaka University, Graduate School of Information Science and Technology',
    title: '博士前期課程 — Linux / FileSystem / IoT / Security',
    titleEn: "M.Sc. — Linux, file systems, IoT and security",
    type: 'minor',
    bullets: [
      '大量の IoT データを低コストに蓄積するためのファイルシステムの設計・実装。情報処理学会論文誌（CDS）に掲載、IEEE PerCom Workshops（PerIoT\'20）で発表',
      'IoT デバイスの踏み台防止、IoT サービスのサーバレス実装に関する研究にも参加',
      '就職活動のときに、研究者志望から「IT で独り立ちできるビジネスをしたい」へ進路を切り替える',
    ],
    summaryEn:
      'Designed and built a file system for storing large volumes of IoT data at low cost. Published in an IPSJ journal (CDS) and at IEEE PerCom Workshops (PerIoT\'20).',
    tags: ['Linux', 'FUSE', 'IoT', 'Security', 'Research'],
  },
  {
    version: 'v0.1.0',
    date: '2015.04 — 2019.03',
    org: '神戸大学 工学部 情報知能工学科',
    orgEn: 'Kobe University, Faculty of Engineering',
    title: '学士課程 — 制約充足問題（SAT）と制約プログラミング',
    titleEn: 'B.Eng. — constraint satisfaction and constraint programming',
    type: 'patch',
    bullets: ['運送計画などの組合せ問題を制約プログラミングで解く研究', 'フットサルサークルの会長'],
    summaryEn: 'Solved scheduling-type combinatorial problems with constraint programming. Ran the university futsal club.',
  },
  {
    version: 'v0.0.1',
    date: '1996.05.07',
    org: '兵庫県',
    orgEn: 'Hyogo, Japan',
    title: '誕生',
    titleEn: 'Born',
    type: 'patch',
    bullets: [],
    summaryEn: 'Initial commit.',
  },
];
