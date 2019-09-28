export default {
  route: {
    dashboard: 'トップ',
    documentation: 'ドキュメント',
    guide: 'ガイド',
    permission: '権限',
    icons: 'アイコン',
    components: 'コンポーネント',
    charts: 'チャート',
    barChart: 'Barチャート',
    lineChart: 'Lineチャート',
    mixedChart: 'Mixedチャート',
    table: 'Table',
    tab: 'Tab',
    form: 'フォーム',
    page404: '404',
    errorLog: 'エラーログ',
    mergeHeader: 'ヘッダーマージ',
    pdf: 'PDF',
    theme: 'テーマ変更',
    i18n: '多言語',
    profile: 'プロフィール'
  },
  navbar: {
    dashboard: 'トップ',
    github: 'GitHub',
    logOut: 'ログアウト',
    profile: 'プロフィール',
    theme: 'テーマ変更',
    size: '画面サイズ'
  },
  login: {
    title: 'ユーザログイン',
    logIn: 'ログイン',
    username: 'ユーザ名',
    password: 'パスワード',
    any: 'any',
    thirdparty: '外部IDでログイン',
    thirdpartyTips: 'ローカル環境ではログインできません。実装が必要です。'
  },
  documentation: {
    documentation: 'ドキュメント',
    github: 'Github Link'
  },
  permission: {
    createRole: 'ロール追加',
    editPermission: 'ロール変更',
    roles: 'ロール',
    switchRoles: 'ロール切替',
    tips: 'v-permissionは使えない時があります。例えば: Element-UI の el-tab、 el-table-column 及び他の dom。v-ifを使う必要があります。',
    delete: '削除',
    confirm: '確認',
    cancel: 'キャンセル'
  },
  guide: {
    description: 'ガイドは各機能の説明です。',
    button: 'ガイドを見る'
  },
  components: {
    documentation: 'ドキュメント',
    stickyTips: 'ページの指定位置へスクロールした場合、表示されます。',
    imageUploadTips: 'mockjsは使えないため、カスタマイズしています。公式の最新バージョンを使ってください。'
  },
  table: {
    dynamicTips1: '先頭は固定、最後に追加',
    dynamicTips2: '戦後に追加せず、指定列に追加',
    dragTips1: 'デフォルト順番',
    dragTips2: 'Drag後の順番',
    title: 'タイトル',
    importance: '重要',
    type: 'タイプ',
    remark: '評価',
    search: '検索',
    add: '追加',
    export: 'エクスポート',
    reviewer: 'レビュアー',
    id: '番号',
    date: '日時',
    author: '作成者',
    readings: '閲覧数',
    status: 'ステータス',
    actions: '操作',
    edit: '編集',
    publish: '公開',
    draft: '下書き',
    delete: 'キャンセル',
    cancel: 'キャンセル',
    confirm: '確認'
  },
  errorLog: {
    tips: '右上のbugアイコンをクリックしてください。',
    description: '管理画面はspaを使う場合が多い、ユーザ体現向上はできますが、想定外エラーが発生する場合があります。Vueはそのエラーハンドリング機能を提供し、エラーレポートができます。',
    documentation: 'ドキュメント'
  },
  pdf: {
    tips: 'window.print() を使ってPDFダウンロードしています。'
  },
  theme: {
    change: 'テーマ切替',
    documentation: 'ドキュメント',
    tips: 'Tips: テーマの切り替え方法はnavbarのtheme-pickと異なります、使い方はドキュメントを確認してください。'
  },
  tagsView: {
    refresh: '更新',
    close: '閉じる',
    closeOthers: 'その他閉じる',
    closeAll: 'すべて閉じる'
  },
  settings: {
    title: 'システムテーマ',
    theme: 'テーマ色',
    showTagsView: 'Tags-View 開く',
    showSidebarLogo: 'Show Sidebar Logo',
    fixedHeader: 'Fixed Header',
    sidebarTextTheme: 'Sidebar Text Theme'
  }
}
