/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const si = {
  // Navigation
  dashboard: 'පාලක පුවරුව',
  notes: 'සටහන්',
  tasks: 'කාර්යයන්',
  daily: 'දිනපතා සටහන්',
  graph: 'ප්‍රස්තාර දර්ශනය',
  analytics: 'විශ්ලේෂණ',
  settings: 'සිටුවම්',
  about: 'ලින්ක්නෝට් ගැන',

  // Actions
  createNewNote: 'නව සටහනක් සාදන්න',
  writeFirstNote: 'පළමු සටහන ලියන්න',
  todaysNote: "අද දවසේ සටහන",
  search: 'සටහන් සොයන්න...',
  searchByTitleContentTags: 'මාතෘකාව, අන්තර්ගතය හෝ ටැග් මඟින් සොයන්න...',
  starred: 'තරු යෙදූ',
  onlyFavorites: 'ප්‍රියතම පමණි',
  sort: 'පිළිවෙල සකසන්න',
  export: 'සටහන අපනයනය',
  import: 'ආනයනය කරන්න',
  trash: 'කසළ බඳුන',
  emptyTrash: 'කසළ බඳුන හිස් කරන්න',
  restore: 'යථා තත්වයට පත් කරන්න',
  deletePermanently: 'ස්ථිරවම මකා දමන්න',
  save: 'සුරකින්න',
  cancel: 'අවලංගු කරන්න',
  close: 'වසන්න',
  edit: 'සංස්කරණය',
  preview: 'පෙරදසුන',
  split: 'බෙදූ දර්ශනය',
  back: 'ආපසු',
  share: 'බෙදාගන්න',
  presentationMode: 'ඉදිරිපත් කිරීමේ ප්‍රකාරය',
  appLock: 'යෙදුම් අගුල',

  // Sorting
  sortUpdated: 'මෑතකදී යාවත්කාලීන කළ',
  sortCreated: 'සාදන ලද දිනය',
  sortTitle: 'අකාරාදී (A-Z)',

  // States
  loading: 'සටහන් පූරණය වෙමින්...',
  loadingIndexedDB: 'ආරක්ෂිත IndexedDB ගබඩාවට පිවිසෙමින්...',
  noNotesFound: 'කිසිදු සටහනක් හමු නොවීය',
  noMatchingNotes: 'ගැලපෙන සටහන් කිසිවක් හමු නොවීය',
  trashEmpty: 'කසළ බඳුන හිස් ය',
  noNotesInFolder: 'මෙම ෆෝල්ඩරයේ සටහන් නොමැත',
  adjustFilters: 'සෙවුම් විෂය පථය පුළුල් කිරීමට වචන, ටැග් වෙනස් කරන්න හෝ ප්‍රියතම පෙරහන ඉවත් කරන්න.',
  trashDescription: 'මකා දැමූ සටහන් තාවකාලිකව මෙහි දිස්වනු ඇත. ස්ථිරවම මකා දැමූ පසු ඒවා නැවත ලබා ගත නොහැක.',
  emptyFolderDescription: 'සටහන් හෝ පාඩම් කාඩ්පත් සෑදීම ආරම්භ කරන්න. සියලුම ලේඛන මෙම ෆෝල්ඩරයට පෙරනිමි වේ.',
  
  // App Lock
  appLocked: 'යෙදුම අගුළු දමා ඇත',
  appLockPlaceholder: 'අගුළු හැරීමට මුරපදය ඇතුළත් කරන්න...',
  unlockButton: 'වැඩබිම අගුළු හරින්න',
  appLockWarning: 'මෙය මෙම බ්‍රවුසරය පමණක් ආරක්ෂා කරයි.',
  appLockIncorrect: 'වැරදි මුරපදයක්. කරුණාකර නැවත උත්සාහ කරන්න.',
  enableAppLock: 'යෙදුම් අගුල සක්‍රීය කරන්න',
  disableAppLock: 'යෙදුම් අගුල අක්‍රීය කරන්න',
  changePassword: 'මුරපදය වෙනස් කරන්න',
  enterNewPassword: 'නව මුරපදය ඇතුළත් කරන්න',
  confirmNewPassword: 'නව මුරපදය තහවුරු කරන්න',
  passwordsDoNotMatch: 'මුරපද නොගැලපේ.',
  appLockTimeout: 'නොබැඳි ස්වයංක්‍රීය අගුළු කාලය',
  timeoutNever: 'කිසිවිටෙක නැත',
  timeoutMinutes: 'විනාඩි {min}',

  // Task list
  taskCompleted: 'කාර්යයන් නිම කර ඇත',
  taskStats: 'කාර්ය සංඛ්‍යාලේඛන',
  totalTasks: 'මුළු කාර්යයන්',
  completedTasks: 'නිම කළ කාර්යයන්',
  pendingTasks: 'ඉතිරිව ඇති කාර්යයන්',
  completionRate: 'සම්පූර්ණ වීමේ ප්‍රතිශතය',
  noTasksFound: 'ඔබේ සටහන්වල කිසිදු කාර්යයක් හමු නොවීය.',
  noTasksDescription: 'ඔබේ සටහන් තුළ - [ ] කාර්යයේ නම ලෙස ලියන්න, ඒවා ස්වයංක්‍රීයව මෙහි දිස්වනු ඇත.',

  // Daily Notes
  streakDays: 'දිනපතා ලිවීමේ අඛණ්ඩතාවය',
  streakCount: 'දින {count}',
  todaysEntry: "අද දවසේ සටහන",
  recentDailyNotes: 'මෑතකාලීන දිනපතා සටහන්',
  noDailyNotes: 'තවමත් දිනපතා සටහන් ලියා නොමැත.',
  dailyNotesDescription: 'ඔබේ දිනපතා සිතුවිලි, සටහන් සහ පුරුදු නිරීක්ෂණය කිරීමට දිනපතා සටහන් පොතක් පවත්වා ගන්න.',
  dailyTemplateTitle: 'දිනපතා සටහන - {date}',

  // Analytics
  activeNotes: 'ක්‍රියාකාරී සටහන්',
  deletedNotes: 'මකා දැමූ සටහන්',
  encryptedNotes: 'සංකේතනය කළ සටහන්',
  totalWords: 'මුළු වචන ගණන',
  totalChars: 'මුළු අකුරු ගණන',
  notesByFolder: 'ෆෝල්ඩර අනුව සටහන්',
  notesByTag: 'ටැග් අනුව සටහන්',
  storageUsed: 'ඇස්තමේන්තුගත ගබඩාව',
  lastBackup: 'අවසන් උපස්ථය',
  neverBackup: 'කිසිවිටෙක නැත',

  // Export
  exportHtml: 'HTML ලෙස අපනයනය කරන්න',
  exportPdf: 'මුද්‍රණය / PDF ලෙස සුරකින්න',
  exportTxt: 'ලියවිල්ල බාගන්න (.txt)',
  exportMd: 'ලියවිල්ල බාගන්න (.md)',
  exportTasksJson: 'කාර්යයන් JSON ලෙස අපනයනය',
  exportTasksMd: 'කාර්යයන් Markdown ලෙස අපනයනය',

  // Misc
  backlinks: 'පසු සබැඳි',
  outgoingLinks: 'බැහැර සබැඳි',
  noBacklinks: 'පසු සබැඳි හමු නොවීය.',
  noOutgoingLinks: 'බැහැර සබැඳි හමු නොවීය.',
  wikiLinkPrompt: 'මෙම සටහන නොපවතී. "{title}" සෑදීමට මෙතැන ක්ලික් කරන්න.',
};
