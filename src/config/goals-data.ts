import { Goal } from '@/types/goals';

export const GOALS_DATABASE: Goal[] = [
  {
    id: 'juz-30',
    nameEnglish: "Juz' 30 (Amma)",
    nameArabic: "جزء عم",
    type: 'juz',
    metadata: {
      versesCount: 564,
      pagesCount: 21,
      quartersCount: 8,
      surahCount: 37,
      defaultUnit: 'surah',
      difficulty: 'short',
    },
    units: [
      { id: 78, name: "An-Naba", arabicName: "النبأ" },
      { id: 79, name: "An-Nazi'at", arabicName: "النازعات" },
      { id: 80, name: "Abasa", arabicName: "عبس" },
      { id: 81, name: "At-Takwir", arabicName: "التكوير" },
      { id: 82, name: "Al-Infitar", arabicName: "الإنفطار" },
      { id: 83, name: "Al-Mutaffifin", arabicName: "المطففين" },
      { id: 84, name: "Al-Inshiqaq", arabicName: "الإنشقاق" },
      { id: 85, name: "Al-Buruj", arabicName: "البروج" },
      { id: 86, name: "At-Tariq", arabicName: "الطارق" },
      { id: 87, name: "Al-A'la", arabicName: "الأعلى" },
      { id: 88, name: "Al-Ghashiyah", arabicName: "الغاشية" },
      { id: 89, name: "Al-Fajr", arabicName: "الفجر" },
      { id: 90, name: "Al-Balad", arabicName: "البلد" },
      { id: 91, name: "Ash-Shams", arabicName: "الشمس" },
      { id: 92, name: "Al-Lail", arabicName: "الليل" },
      { id: 93, name: "Ad-Duha", arabicName: "الضحى" },
      { id: 94, name: "Ash-Sharh", arabicName: "الشرح" },
      { id: 95, name: "At-Tin", arabicName: "التين" },
      { id: 96, name: "Al-Alaq", arabicName: "العلق" },
      { id: 97, name: "Al-Qadr", arabicName: "القدر" },
      { id: 98, name: "Al-Bayyinah", arabicName: "البينة" },
      { id: 99, name: "Az-Zalzalah", arabicName: "الزلزلة" },
      { id: 100, name: "Al-Adiyat", arabicName: "العاديات" },
      { id: 101, name: "Al-Qari'ah", arabicName: "القارعة" },
      { id: 102, name: "At-Takathur", arabicName: "التكاثر" },
      { id: 103, name: "Al-Asr", arabicName: "العصر" },
      { id: 104, name: "Al-Humazah", arabicName: "الهمزة" },
      { id: 105, name: "Al-Fil", arabicName: "الفيل" },
      { id: 106, name: "Quraish", arabicName: "قريش" },
      { id: 107, name: "Al-Ma'un", arabicName: "الماعون" },
      { id: 108, name: "Al-Kawthar", arabicName: "الكوثر" },
      { id: 109, name: "Al-Kafirun", arabicName: "الكافرون" },
      { id: 110, name: "An-Nasr", arabicName: "النصر" },
      { id: 111, name: "Al-Masad", arabicName: "المسد" },
      { id: 112, name: "Al-Ikhlas", arabicName: "الإخلاص" },
      { id: 113, name: "Al-Falaq", arabicName: "الفلق" },
      { id: 114, name: "An-Nas", arabicName: "الناس" },
    ],
    description: 'Learn the last Juz of the Quran with 37 short Surahs',
  },
  {
    id: 'juz-29',
    nameEnglish: "Juz' 29 (Tabaarak)",
    nameArabic: "جزء تبارك",
    type: 'juz',
    metadata: {
      versesCount: 447,
      pagesCount: 20,
      quartersCount: 8,
      surahCount: 11,
      defaultUnit: 'surah',
      difficulty: 'medium',
    },
    units: [
      { id: 67, name: "Al-Mulk", arabicName: "الملك" },
      { id: 68, name: "Al-Qalam", arabicName: "القلم" },
      { id: 69, name: "Al-Haqqah", arabicName: "الحاقة" },
      { id: 70, name: "Al-Ma'arij", arabicName: "المعارج" },
      { id: 71, name: "Nuh", arabicName: "نوح" },
      { id: 72, name: "Al-Jinn", arabicName: "الجن" },
      { id: 73, name: "Al-Muzzammil", arabicName: "المزمل" },
      { id: 74, name: "Al-Muddathir", arabicName: "المدثر" },
      { id: 75, name: "Al-Qiyamah", arabicName: "القيامة" },
      { id: 76, name: "Al-Insan", arabicName: "الإنسان" },
      { id: 77, name: "Al-Mursalat", arabicName: "المرسلات" },
    ],
    description: 'Master the blessed Juz with 11 Surahs of varying lengths',
  },
];

export function getGoalById(id: string): Goal | undefined {
  return GOALS_DATABASE.find(goal => goal.id === id);
}

export function getAllGoals(): Goal[] {
  return GOALS_DATABASE;
}
