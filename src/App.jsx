import React, { useState, useEffect, useRef } from 'react';

// --- ダミーデータ ---
const initialClientsData = [
  { id: 1, name: '鈴木 一郎', furigana: 'スズキ イチロウ', age: 85, gender: '男性', careLevel: '要介護3', birthdate: '1939-05-15', address: '東京都渋谷区神南1-1-1', phone: '090-1234-5678', keyPerson: '鈴木 花子 (長女)', emergencyContact: '080-8765-4321', insuranceEndDate: '2025-10-15' },
  { id: 2, name: '佐藤 花子', furigana: 'サトウ ハナコ', age: 92, gender: '女性', careLevel: '要支援2', birthdate: '1932-11-20', address: '東京都世田谷区北沢2-2-2', phone: '090-2345-6789', keyPerson: '佐藤 太郎 (長男)', emergencyContact: '080-9876-5432', insuranceEndDate: '2025-11-20' },
  { id: 3, name: '高橋 健太', furigana: 'タカハシ ケンタ', age: 78, gender: '男性', careLevel: '要介護1', birthdate: '1946-02-10', address: '東京都新宿区西新宿3-3-3', phone: '090-3456-7890', keyPerson: '高橋 良子 (妻)', emergencyContact: '080-1122-3344', insuranceEndDate: '2026-01-10' },
];

const initialAnnouncements = {
  '業務連絡': [ { id: 1, author: '田中', content: '【重要】9/20の全体ミーティングは13時からに変更します。', timestamp: '2025-09-16 09:30' }, { id: 2, author: '管理者', content: '新しいマニュアルを共有フォルダにアップしました。各自確認してください。', timestamp: '2025-09-15 15:00' } ],
  '申し送り': [ { id: 3, author: '鈴木', content: '佐藤様、昨日から少し食欲がないご様子です。水分補給を重点的にお願いします。', timestamp: '2025-09-16 08:45' } ],
  '書類期限': [ { id: 4, author: 'システム', content: '高橋様のサービス計画書の提出期限は【9月25日】です。', timestamp: '2025-09-15 10:00' } ]
};

const initialManualsData = [
    { id: 1, title: '緊急時対応マニュアル', category: '基本手順', lastUpdated: '2025-08-01', content: '利用者の転倒や急な体調不良が発生した場合の手順書です。まず意識の確認を行い...' },
    { id: 2, title: '感染症対策マニュアル', category: '衛生管理', lastUpdated: '2025-09-05', content: '標準予防策（スタンダードプリコーション）に基づいた対応手順を定めています。...' },
    { id: 3, title: '個人情報保護について', category: 'コンプライアンス', lastUpdated: '2025-07-15', content: '利用者様の個人情報を適切に取り扱うためのルールです。...' }
];

const initialShiftData = {
  date: '2025-09-17',
  shifts: [
    { staffName: '山田 太郎', shift: '早番', time: '8:00 - 17:00' },
    { staffName: '田中 花子', shift: '早番', time: '8:00 - 17:00' },
    { staffName: '佐藤 次郎', shift: '日勤', time: '9:00 - 18:00' },
    { staffName: '鈴木 美穂', shift: '遅番', time: '11:00 - 20:00' },
    { staffName: '高橋 清', shift: '夜勤', time: '17:00 - 翌9:00' },
  ]
};

const initialScheduleData = [
    { id: 1, date: '2025-09-22', time: '14:00', type: 'conference', title: '鈴木一郎様 担当者会議', attendees: ['山田太郎', '鈴木花子(長女)', 'Dr.中村'], location: 'デイルーム' },
    { id: 2, date: '2025-09-25', time: '10:00', type: 'contract', title: '高橋健太様 新規契約', attendees: ['山田太郎', '高橋良子(妻)'], location: '相談室' },
    { id: 3, date: '2025-09-18', time: '09:00', type: 'visit', title: '佐藤花子様 通院付き添い', attendees: ['田中花子'], location: 'さくら病院' },
    { id: 4, date: '2025-09-20', time: '13:00', type: 'internal', title: '全体ミーティング', attendees: ['職員全員'], location: '事務所' },
];

const initialCareRecordsData = [
  { id: 101, clientName: '鈴木 一郎', dateTime: '2025-09-17 10:00', summary: '訪問介護のサービスを提供。', serviceType: '訪問介護' },
  { id: 102, clientName: '鈴木 一郎', dateTime: '2025-09-10 14:00', summary: '訪問リハビリテーションのサービスを提供。', serviceType: '訪問リハビリ' },
  { id: 103, clientName: '鈴木 一郎', dateTime: '2025-09-17 14:00', summary: '訪問リハビリテーションのサービスを提供。', serviceType: '訪問リハビリ' },
];

const sampleTranscript = `ケアマネ：こんにちは、鈴木さん。今日は退院後のお体の調子はいかがですか？\n利用者（鈴木さん）：おかげさまで、だいぶいいですよ。でもね、やっぱり家の周りを一人で歩くのが少し不安でね。特にスーパーへの坂道が…。\nケアマネ：そうでしたか。お買い物は週にどれくらい行かれますか？\n利用者（鈴木さん）：週に2回くらいかな。娘も手伝ってくれるんだけど、いつも頼むのは申し訳なくて。自分のことは自分でやりたいんですよ。\nケアマネ：素晴らしいお気持ちですね。そのお気持ちを大切にしたいです。まず、家の周りを安全に歩けるようになることが目標ですね。\n利用者（鈴木さん）：そうなんです。天気の良い日に、また散歩できるようになりたいな。\nケアマネ：いい目標ですね！では、最初の3ヶ月は、週に1回、訪問リハビリの先生と一緒に歩く練習をしてみるのはいかがでしょう？坂道も安全に上り下りできるようになりますよ。\n利用者（鈴木さん）：あら、そんなことができるの？それなら安心だわ。\nケアマネ：はい。そして、もしリハビリがお休みの日に買い物が必要になったら、ヘルパーさんに付き添ってもらうこともできます。いかがですか？\n利用者（鈴木さん）：それなら、娘にも心配かけずに済みそうね。ぜひお願いします。`;

// --- API通信のシミュレーション ---
const fetchClientsFromAPI = () => new Promise(resolve => setTimeout(() => resolve(initialClientsData), 500));
const postAnnouncementToAPI = (announcement) => new Promise(resolve => setTimeout(() => resolve({ ...announcement, id: Date.now() }), 300));
const generateDocumentFromTextAPI = (text) => new Promise(resolve => {
    setTimeout(() => {
        const client = initialClientsData[0]; // 鈴木さん
        const plan = {
            form1: {
                clientName: client.name,
                creationDate: new Date().toLocaleDateString('ja-JP-u-ca-japanese', { era: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                creatorName: '山田 太郎',
                clientAddress: client.address,
                clientBirthdate: client.birthdate,
                userIntent: '・自宅周辺、特に坂道での独歩に不安がある。\n・娘に頼りすぎることなく、自分で買い物など身の回りのことを行いたいという意欲が強い。\n・天気の良い日には散歩を楽しみたいという希望がある。',
                overallPolicy: '本人の「自分でやりたい」という意欲を最大限尊重する。安全な歩行能力の再獲得と外出への自信回復を目的とし、専門職によるリハビリテーションと、必要に応じたヘルパーの同行支援を組み合わせる。家族の介護負担にも配慮し、本人が主体的に生活を再構築できるよう支援する。'
            },
            form2: {
                needs: '退院後の独歩、特に自宅周辺の坂道に対して不安がある。他者の援助を借りずに、自立して買い物に行きたいという強い意欲がある。',
                longTermGoal: '一人で安全に近所のスーパーまで買い物に行き、自宅まで帰ってくることができる。',
                longTermGoalPeriod: '6ヶ月',
                shortTermGoal: '訪問リハビリ専門職の指導のもと、杖歩行にて自宅から100m先の公園まで安定して往復できるようになる。',
                shortTermGoalPeriod: '3ヶ月',
                serviceDetails: [
                    { type: '訪問リハビリテーション', provider: 'さくら訪問リハビリ事業所', content: '理学療法士による歩行訓練、筋力トレーニング', frequency: '週1回' },
                    { type: '訪問介護', provider: '当事業所', content: 'ヘルパー付き添いのもと、スーパーへの買い物', frequency: '週1回' },
                ]
            },
            form3: {
                weekStartDate: '2025-09-22',
                schedule: {
                    '月': [{ time: '10:00-11:00', service: '買い物同行（訪問介護）' }],
                    '火': [],
                    '水': [{ time: '14:00-15:00', service: '訪問リハビリ' }],
                    '木': [],
                    '金': [],
                    '土': [],
                    '日': [],
                }
            }
        };
        resolve(plan);
    }, 1500);
});

// --- アイコンコンポーネント ---
const Icon = ({ name, className }) => {
  const icons = {
    home: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    clipboard: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></>,
    'file-text': <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></>,
    'file-plus': <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></>,
    'file-check': <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="m9 15 2 2 4-4" /></>,
    calendar: <><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></>,
    settings: <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></>,
    menu: <><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></>,
    search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
    chevronLeft: <path d="m15 18-6-6 6-6" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
    user: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
    info: <><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="16" y2="12" /><line x1="12" x2="12.01" y1="8" y2="8" /></>,
    logOut: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    google: <path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5.27,16.18 5.27,12.31C5.27,8.44 8.36,5.35 12.19,5.35C14.06,5.35 15.63,6.02 16.78,7.11L18.83,5.06C17,3.32 14.81,2.27 12.19,2.27C6.42,2.27 2.03,6.82 2.03,12.31C2.03,17.8 6.42,22.35 12.19,22.35C17.96,22.35 21.5,18.49 21.5,12.56C21.5,11.97 21.43,11.52 21.35,11.1Z" fill="currentColor" stroke="none" />,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    send: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></>,
    sparkles: <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9L12 18l1.9-5.8 5.8-1.9-5.8-1.9L12 3z" />,
    printer: <><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></>,
    alert: <><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" /></>
  };
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{icons[name]}</svg>;
};

// --- 国保連エラーチェック用データ ---
const careInsuranceErrorCodes = [
  {
    code: '1001',
    title: '被保険者番号の不一致',
    description: '請求データの被保険者番号が国保連マスタの情報と一致していません。',
    checkPoints: [
      '利用者情報の被保険者番号が最新か確認する',
      '数字の入力ミス（0とOなど）がないか確認する',
    ],
    resolution: '介護ソフト上の利用者情報を修正し、再度請求データを作成してください。',
  },
  {
    code: '1005',
    title: '資格喪失後の請求',
    description: '資格喪失日以降のサービス提供分が請求されています。',
    checkPoints: [
      '資格有効期限とサービス提供日を突き合わせる',
      '更新手続きの状況を自治体へ確認する',
    ],
    resolution: '資格有効期間内のみ請求が可能です。提供記録と保険者情報を確認し、期間外分は修正してください。',
  },
  {
    code: '2002',
    title: '単位数の上限超過',
    description: '月次限度額を超える単位数が入力されています。',
    checkPoints: [
      '居宅介護支援で作成した給付管理票の上限値',
      '加算や特別地域単価の算定方法',
    ],
    resolution: '給付管理票を確認し、上限内に収まるよう単位数を調整してください。必要に応じてケアマネジャーへ連絡を取ります。',
  },
  {
    code: '3010',
    title: '加算算定条件未達',
    description: '算定した加算が必要条件を満たしていないと判断されました。',
    checkPoints: [
      '算定要件に必要な記録・会議録の有無',
      '提供回数や配置基準が満たされているか',
    ],
    resolution: '算定根拠を再確認し、必要書類が整っていなければ請求から除外するか、根拠を整備した上で再請求します。',
  },
  {
    code: '4013',
    title: '同一日に複数サービス請求',
    description: '同一事業所で重複するサービスコードが登録されています。',
    checkPoints: [
      '同日に複数のサービスを登録していないか',
      '短期入所との併用が禁止されていないか',
    ],
    resolution: '組み合わせが認められているかサービスコード表を確認し、必要な方を残して重複分を削除します。',
  },
];

const disabilityWelfareErrorCodes = [
  {
    code: 'D101',
    title: '受給者証番号の誤り',
    description: '障害福祉サービス受給者証に記載の番号と請求データが一致していません。',
    checkPoints: [
      '受給者証の番号と有効期間',
      'サービス種別の記載内容',
    ],
    resolution: '最新の受給者証を確認し、番号を修正して再作成してください。',
  },
  {
    code: 'D205',
    title: '支給量の超過',
    description: '支給決定量を超えるサービス提供量が登録されています。',
    checkPoints: [
      '支給決定量と提供実績の突合',
      '他事業所の利用状況',
    ],
    resolution: '支給量の範囲内で提供実績を調整するか、自治体へ支給量の変更申請を検討します。',
  },
  {
    code: 'D307',
    title: '利用者負担上限額管理票未作成',
    description: '上限管理事業所としての管理票が提出されていません。',
    checkPoints: [
      '上限管理事業所の指定状況',
      '他事業所との情報連携',
    ],
    resolution: '利用者負担上限額管理票を作成し、記録を添付してから請求データを再送信してください。',
  },
  {
    code: 'D411',
    title: '送迎加算の算定不可',
    description: '送迎加算を算定できないサービス種別で送迎加算が入力されています。',
    checkPoints: [
      'サービスコード表で送迎加算の可否を確認',
      '他の加算との算定関係',
    ],
    resolution: '対象外のサービスに送迎加算は付けられません。加算を外して再送信してください。',
  },
  {
    code: 'D520',
    title: '成果報酬の算定誤り',
    description: '就労系サービスで成果報酬を算定する際の対象条件が満たされていません。',
    checkPoints: [
      '就労継続支援の目標達成状況',
      '支援記録と雇用契約の確認',
    ],
    resolution: '成果要件を満たしていない場合は請求から除外し、要件を確認してから再請求します。',
  },
];

const ErrorCodeCheckerPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('care');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedError, setSelectedError] = useState(null);

  const tabs = [
    { id: 'care', label: '介護保険' },
    { id: 'disability', label: '障害福祉' },
  ];

  const errorCodes = selectedCategory === 'care' ? careInsuranceErrorCodes : disabilityWelfareErrorCodes;

  const filteredErrorCodes = errorCodes.filter(({ code, title, description }) => {
    if (!searchTerm) return true;
    const keyword = searchTerm.trim().toLowerCase();
    return (
      code.toLowerCase().includes(keyword) ||
      title.toLowerCase().includes(keyword) ||
      description.toLowerCase().includes(keyword)
    );
  });

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchTerm('');
    setSelectedError(null);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (value === '') {
      setSelectedError(null);
    }
  };

  const handleSelectError = (error) => {
    setSelectedError(error);
  };

  const activeError = selectedError || filteredErrorCodes[0] || null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white shadow-sm rounded-2xl p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sky-600 font-semibold">
              <Icon name="alert" className="w-5 h-5" />
              <span>国保連請求エラーチェック</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">エラーコード検索ツール</h1>
            <p className="text-sm text-slate-600 mt-2">
              介護保険と障害福祉のエラーコードを切り替えて、発生原因と確認ポイントを即座に確認できます。
            </p>
          </div>
          <div className="flex items-center gap-2 bg-sky-50 text-sky-700 px-4 py-2 rounded-xl text-sm">
            <Icon name="info" className="w-4 h-4" />
            <span>コード・キーワードで検索できます</span>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleSelectCategory(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === tab.id
                  ? 'bg-sky-600 text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-4 relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Icon name="search" className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="エラーコードやキーワードで検索 (例: 1001 / 資格)"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)]">
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{tabs.find((tab) => tab.id === selectedCategory)?.label}のエラー一覧</h2>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              {filteredErrorCodes.length}件
            </span>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {filteredErrorCodes.length === 0 ? (
              <div className="px-6 py-16 text-center text-sm text-slate-500">
                該当するエラーが見つかりませんでした。検索条件を変更してください。
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredErrorCodes.map((error) => {
                  const isActive = activeError?.code === error.code;
                  return (
                    <li key={error.code}>
                      <button
                        onClick={() => handleSelectError(error)}
                        className={`w-full text-left px-6 py-4 flex items-start gap-4 transition-colors ${
                          isActive ? 'bg-sky-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <span
                          className={`text-xs font-semibold tracking-wider px-2.5 py-1 rounded-full uppercase ${
                            isActive ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {error.code}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{error.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{error.description}</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-2xl p-6 h-fit">
          {activeError ? (
            <div className="space-y-4">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-medium text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
                  <Icon name="info" className="w-4 h-4" />
                  詳細情報
                </span>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{activeError.code}：{activeError.title}</h3>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-700">
                {activeError.description}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">確認ポイント</h4>
                <ul className="mt-2 space-y-2 text-sm text-slate-700 list-disc pl-5">
                  {activeError.checkPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">対応方法</h4>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">{activeError.resolution}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-sm text-slate-500 py-10">
              <Icon name="search" className="w-6 h-6 mb-2" />
              <p>左側の一覧からエラーコードを選択してください。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ... (他のコンポーネントは省略) ...

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedManual, setSelectedManual] = useState(null);
  const [manuals, setManuals] = useState(initialManualsData);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [careRecords, setCareRecords] = useState(initialCareRecordsData);

  const navItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: 'home' }, 
    { id: 'clients', label: '利用者管理', icon: 'users' }, 
    { id: 'records', label: '介護記録', icon: 'clipboard' }, 
    { id: 'care-plans', label: '計画書作成', icon: 'file-plus' }, 
    { id: 'service-slips', label: 'サービス利用票', icon: 'file-check' }, 
    { id: 'schedule', label: 'スケジュール', icon: 'calendar' }, 
    { id: 'manuals', label: 'マニュアル管理', icon: 'book' },
    { id: 'error-checker', label: '国保連エラー', icon: 'alert' },
    { id: 'attendance', label: '勤怠管理', icon: 'clock' },
    { id: 'settings', label: '設定', icon: 'settings' },
  ];

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadClients = async () => { setIsLoading(true); try { setClients(await fetchClientsFromAPI()); } catch (err) { setError(err.message); } finally { setIsLoading(false); }};
    loadClients();
  }, [isAuthenticated]);

  const handleLogin = () => {
      const mockUser = { id: 1, name: '山田 太郎', email: 'taro.yamada@example.com', picture: 'https://placehold.co/100x100/E2E8F0/475569?text=Y' };
      setCurrentUser(mockUser); setIsAuthenticated(true);
      const newRecord = { id: Date.now(), userId: mockUser.id, userName: mockUser.name, loginTime: new Date().toISOString(), logoutTime: null };
      setAttendanceRecords(prev => [...prev, newRecord]);
  };
  
  const handleLogout = () => {
      setAttendanceRecords(prev => prev.map(rec => rec.userId === currentUser.id && rec.logoutTime === null ? { ...rec, logoutTime: new Date().toISOString() } : rec));
      setIsAuthenticated(false); setCurrentUser(null);
  };
  
  const handleNavigate = (page, param = null) => {
    setCurrentPage(page); 
    setSelectedClient(null); 
    setSelectedManual(null);
    if (page === 'manuals' && typeof param === 'number') { 
      const manual = manuals.find(m => m.id === param); 
      if (manual) setSelectedManual(manual); 
    }
    if (page === 'clients' && typeof param === 'number') {
        const client = clients.find(c => c.id === param);
        if (client) setSelectedClient(client);
    }
  };
  
  const handleSelectClient = (client) => { setSelectedClient(client); setCurrentPage('clients'); }; const handleBackToList = () => { setSelectedClient(null); };
  const handleSelectManual = (manual) => { setSelectedManual(manual); }; const handleBackToManuals = () => { setSelectedManual(null); };

  const renderContent = () => {
    if (currentPage === 'clients' && selectedClient) return <ClientDetail client={selectedClient} onBack={handleBackToList} />;
    if (currentPage === 'manuals' && selectedManual) return <ManualDetail manual={selectedManual} onBack={handleBackToManuals} />;
    
    switch (currentPage) {
      case 'dashboard': return <DashboardHome user={currentUser} onNavigate={handleNavigate} navItems={navItems} clients={clients} />;
      case 'clients': return <ClientList clients={clients} onSelectClient={handleSelectClient} isLoading={isLoading} error={error} />;
      case 'records': return <CareRecordsPage clients={clients} careRecords={careRecords} setCareRecords={setCareRecords} />;
      case 'care-plans': return <CarePlanFromTextPage />;
      case 'service-slips': return <ServiceSlipsPage clients={clients} careRecords={careRecords} />;
      case 'schedule': return <SchedulePage events={initialScheduleData} />;
      case 'manuals': return <ManualsPage manuals={manuals} onSelectManual={handleSelectManual} />;
      case 'error-checker': return <ErrorCodeCheckerPage />;
      case 'attendance': return <AttendancePage records={attendanceRecords} />;
      case 'settings': return <PlaceholderPage title="設定" />;
      default: return <DashboardHome user={currentUser} onNavigate={handleNavigate} navItems={navItems} clients={clients} />;
    }
  };
  
  if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className={`flex h-screen bg-sky-50 transition-all duration-300 ${isSidebarOpen ? '' : 'md:pl-20'}`}>
      <Sidebar onNavigate={handleNavigate} currentPage={currentPage} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} navItems={navItems} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(prev => !prev)} user={currentUser} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6"><div className="h-full">{renderContent()}</div></main>
      </div>
    </div>
  );
};

export default App;