/**
 * Verse Utilities
 * Helper functions for working with Quran verse references
 * Format: "surah:verse" (e.g., "1:1", "2:286")
 */

export interface VerseReference {
  surah: number;
  verse: number;
}

/**
 * Parse a verse string into surah and verse numbers
 * @param verse - Verse string in format "surah:verse"
 * @returns Parsed verse reference or null if invalid format
 */
export function parseVerse(verse: string): VerseReference | null {
  const match = verse.match(/^(\d+):(\d+)$/);
  if (!match) {
    console.warn(`Invalid verse format: ${verse}`);
    return null;
  }

  return {
    surah: parseInt(match[1], 10),
    verse: parseInt(match[2], 10),
  };
}

/**
 * Format a verse reference to a string
 * @param surah - Surah number
 * @param verse - Verse number
 * @returns Formatted verse string
 */
export function formatVerse(surah: number, verse: number): string {
  return `${surah}:${verse}`;
}

/**
 * Format a verse range for display (e.g., "1-5")
 * @param startVerse - Start verse number
 * @param endVerse - End verse number
 * @returns Formatted range
 */
export function formatVerseRange(startVerse: number, endVerse: number): string {
  return `${startVerse}-${endVerse}`;
}

/**
 * Format a full verse range with surah context
 * @param startVerse - Start verse in format "surah:verse"
 * @param endVerse - End verse in format "surah:verse"
 * @returns Formatted full range
 */
export function formatFullVerseRange(startVerse: string, endVerse: string): string {
  const start = parseVerse(startVerse);
  const end = parseVerse(endVerse);

  if (!start || !end) {
    return `${startVerse} - ${endVerse}`;
  }

  // If same surah
  if (start.surah === end.surah) {
    return `${start.surah}:${start.verse}-${end.verse}`;
  }

  // Different surahs
  return `${start.surah}:${start.verse} - ${end.surah}:${end.verse}`;
}

/**
 * Get the next verse reference
 * @param verse - Current verse string
 * @returns Next verse or null if invalid
 */
export function getNextVerse(verse: string): string | null {
  const parsed = parseVerse(verse);
  if (!parsed) {
    return null;
  }

  const nextVerse = parsed.verse + 1;

  // Note: This doesn't validate against actual Quran structure
  // In a real app, you'd check against a verse count map
  return formatVerse(parsed.surah, nextVerse);
}

/**
 * Get the previous verse reference
 * @param verse - Current verse string
 * @returns Previous verse or null if invalid
 */
export function getPreviousVerse(verse: string): string | null {
  const parsed = parseVerse(verse);
  if (!parsed || parsed.verse <= 1) {
    return null;
  }

  return formatVerse(parsed.surah, parsed.verse - 1);
}

/**
 * Calculate the number of verses between two verse references
 * @param startVerse - Start verse string
 * @param endVerse - End verse string
 * @returns Number of verses, or null if invalid
 */
export function getVerseCount(startVerse: string, endVerse: string): number | null {
  const start = parseVerse(startVerse);
  const end = parseVerse(endVerse);

  if (!start || !end || start.surah !== end.surah) {
    return null;
  }

  return end.verse - start.verse + 1;
}

/**
 * Check if a verse is within a range
 * @param verse - Verse to check
 * @param startVerse - Start of range
 * @param endVerse - End of range
 * @returns True if verse is within range
 */
export function isVerseInRange(
  verse: string,
  startVerse: string,
  endVerse: string
): boolean {
  const v = parseVerse(verse);
  const start = parseVerse(startVerse);
  const end = parseVerse(endVerse);

  if (!v || !start || !end) {
    return false;
  }

  // Must be same surah
  if (v.surah !== start.surah || v.surah !== end.surah) {
    return false;
  }

  return v.verse >= start.verse && v.verse <= end.verse;
}

/**
 * Get Quranic surah name by number (English)
 * Note: This is a subset - in production, use a complete map
 */
const SURAH_NAMES_EN: Record<number, string> = {
  1: 'Al-Fatiha',
  2: 'Al-Baqarah',
  3: 'Aal-e-Imran',
  18: 'Al-Kahf',
  55: 'Ar-Rahman',
  56: 'Al-Waqiah',
  67: 'Al-Mulk',
  68: 'Al-Qalam',
  69: 'Al-Haqqah',
  70: 'Al-Ma\'arij',
  71: 'Nuh',
  72: 'Al-Jinn',
  73: 'Al-Muzzammil',
  74: 'Al-Muddathir',
  75: 'Al-Qiyamah',
  76: 'Al-Insan',
  77: 'Al-Mursalat',
  78: 'An-Naba',
  79: 'An-Nazi\'at',
  80: 'Abasa',
  81: 'At-Takwir',
  82: 'Al-Infitar',
  83: 'Al-Mutaffifin',
  84: 'Al-Inshiqaq',
  85: 'Al-Buruj',
  86: 'At-Tariq',
  87: 'Al-A\'la',
  88: 'Al-Ghashiyah',
  89: 'Al-Fajr',
  90: 'Al-Balad',
  91: 'Ash-Shams',
  92: 'Al-Lail',
  93: 'Ad-Duha',
  94: 'Ash-Sharh',
  95: 'At-Tin',
  96: 'Al-Alaq',
  97: 'Al-Qadr',
  98: 'Al-Bayyinah',
  99: 'Az-Zalzalah',
  100: 'Al-Adiyat',
  101: 'Al-Qari\'ah',
  102: 'At-Takathur',
  103: 'Al-Asr',
  104: 'Al-Humazah',
  105: 'Al-Fil',
  106: 'Quraish',
  107: 'Al-Ma\'un',
  108: 'Al-Kawthar',
  109: 'Al-Kafirun',
  110: 'An-Nasr',
  111: 'Al-Masad',
  112: 'Al-Ikhlas',
  113: 'Al-Falaq',
  114: 'An-Nas',
};

/**
 * Get surah name by number
 * @param surahNumber - Surah number (1-114)
 * @returns Surah name or empty string if not found
 */
export function getSurahName(surahNumber: number): string {
  return SURAH_NAMES_EN[surahNumber] || '';
}

/**
 * Format a verse with surah name
 * @param verse - Verse string
 * @returns Formatted string with surah name (e.g., "Al-Fatiha 1:1")
 */
export function formatVerseWithSurahName(verse: string): string {
  const parsed = parseVerse(verse);
  if (!parsed) {
    return verse;
  }

  const surahName = getSurahName(parsed.surah);
  if (!surahName) {
    return verse;
  }

  return `${surahName} ${parsed.surah}:${parsed.verse}`;
}
