/** 論文・発表。新しいものを上に。kind は見出しラベルに使う。 */
export type Publication = {
  kind: 'journal' | 'international' | 'domestic';
  authors: string;
  title: string;
  titleEn?: string;
  venue: string;
  venueEn?: string;
  year: string;
  link?: string;      // 書誌ページ
  linkLabel?: string;
  pdf?: string;       // 本文 PDF
  doi?: string;
  extra?: boolean;    // true なら「追加で表示する」を押すまで隠す
};

export const publications: Publication[] = [
  {
    kind: 'domestic',
    authors: '岡本 祐樹, 荒井 研一, 小林 透, 藤橋 卓也, 渡辺 尚, 猿渡 俊介',
    title: 'DIY-SDFS: オンサイト利用を想定したIoTデータ向け複数NAS統合型ファイルシステム',
    titleEn: 'DIY-SDFS: A NAS Integrated File System for On-site IoT Data Storage',
    venue: '情報処理学会論文誌 コンシューマ・デバイス＆システム（CDS）, Vol.11, No.1, pp.14–25',
    venueEn: 'IPSJ Transactions on Consumer Devices & Systems',
    year: '2021',
    link: 'https://ipsj.ixsq.nii.ac.jp/records/210375',
    linkLabel: 'IPSJ 電子図書館',
  },
  {
    kind: 'domestic',
    authors: '仲渡 和政, 岡本 祐樹, 椎名 亮太, 藤橋 卓也, 猿渡 俊介, 渡辺 尚',
    title: 'IoTデバイスの踏み台防止に関する初期的検討',
    titleEn: 'A preliminary study on preventing IoT devices from being used as stepping stones',
    venue: '電子情報通信学会 総合大会',
    venueEn: 'IEICE General Conference',
    year: '2021',
  },
  {
    kind: 'international',
    authors: 'Yuki Okamoto, Kenichi Arai, Toru Kobayashi, Takuya Fujihashi, Takashi Watanabe, Shunsuke Saruwatari',
    title: 'A NAS Integrated File System for On-site IoT Data Storage',
    venue: '4th International Workshop on Mobile and Pervasive Internet of Things (PerIoT\'20), IEEE PerCom Workshops, Austin, TX',
    year: '2020',
    doi: '10.1109/PerComWorkshops48775.2020.9156143',
    link: 'https://ieeexplore.ieee.org/document/9156143/',
    linkLabel: 'IEEE Xplore',
    pdf: 'https://sarulab.ist.osaka-u.ac.jp/pdf/open/periot20_okamoto_submit.pdf',
  },
  {
    kind: 'domestic',
    authors: '岡本 祐樹, 荒井 研一, 小林 透, 藤橋 卓也, 渡辺 尚, 猿渡 俊介',
    extra: true,
    title: 'オンサイト利用を想定したIoTデータのための複数NAS統合型ファイルシステムの提案',
    titleEn: 'A NAS-integrated file system for on-site IoT data',
    venue: '情報処理学会 コンシューマ・デバイス＆システム（CDS）研究会',
    venueEn: 'IPSJ SIG-CDS',
    year: '2020',
  },
  {
    kind: 'domestic',
    authors: '岡本 祐樹, 荒井 研一, 小林 透, 藤橋 卓也, 渡辺 尚, 猿渡 俊介',
    extra: true,
    title: '時系列IoTデータのための複数NAS統合型ファイルシステムにおける課題と検討',
    titleEn: 'Challenges in a NAS-integrated file system for time-series IoT data',
    venue: '電子情報通信学会 ソサイエティ大会',
    venueEn: 'IEICE Society Conference',
    year: '2019',
  },
];
