/**
 * Quran.com API Service
 * Handles fetching Quranic metadata from the Quran.com API v4
 * Includes in-memory caching to minimize API calls
 */

const QURAN_API_BASE_URL = 'https://api.quran.com/api/v4';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds

export interface VerseMetadata {
  verse: string; // Format: "surah:verse"
  wordCount: number;
  timingInfo?: {
    estimatedDuration: number; // in seconds
  };
  text?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Simple in-memory cache
const cache = new Map<string, CacheEntry<any>>();

/**
 * Check if cached data is still valid
 */
function isCacheValid<T>(entry: CacheEntry<T> | undefined): entry is CacheEntry<T> {
  if (!entry) return false;
  const now = Date.now();
  return now - entry.timestamp < CACHE_DURATION;
}

/**
 * Get cached data or null if expired
 */
function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (isCacheValid(entry)) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

/**
 * Store data in cache
 */
function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Parse verse string format "surah:verse" into components
 */
function parseVerse(verse: string): { surah: number; verse: number } | null {
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

export const quranApiService = {
  /**
   * Fetch metadata for a specific verse from Quran.com API
   * Returns word count and other metadata
   */
  async getVerseMetadata(verse: string): Promise<VerseMetadata | null> {
    const cacheKey = `verse_metadata_${verse}`;
    const cached = getFromCache<VerseMetadata>(cacheKey);
    if (cached) {
      return cached;
    }

    const parsed = parseVerse(verse);
    if (!parsed) {
      return null;
    }

    try {
      const response = await fetch(
        `${QURAN_API_BASE_URL}/verses/by_number/${parsed.surah}/${parsed.verse}`
      );

      if (!response.ok) {
        console.warn(`Failed to fetch verse ${verse}: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      const verseData = data.verse;

      if (!verseData) {
        console.warn(`No data found for verse ${verse}`);
        return null;
      }

      const metadata: VerseMetadata = {
        verse,
        wordCount: verseData.words ? verseData.words.length : 0,
        text: verseData.text_uthmani || '',
      };

      setCache(cacheKey, metadata);
      return metadata;
    } catch (error) {
      console.error(`Error fetching metadata for verse ${verse}:`, error);
      return null;
    }
  },

  /**
   * Fetch metadata for multiple verses
   */
  async getMultipleVersesMetadata(verses: string[]): Promise<Map<string, VerseMetadata>> {
    const results = new Map<string, VerseMetadata>();

    // Try to get all from cache first
    const toFetch: string[] = [];
    for (const verse of verses) {
      const cached = getFromCache<VerseMetadata>(`verse_metadata_${verse}`);
      if (cached) {
        results.set(verse, cached);
      } else {
        toFetch.push(verse);
      }
    }

    // Fetch remaining verses
    for (const verse of toFetch) {
      const metadata = await this.getVerseMetadata(verse);
      if (metadata) {
        results.set(verse, metadata);
      }
    }

    return results;
  },

  /**
   * Fetch word count for a verse
   * Useful for estimating reading duration
   */
  async getWordCount(verse: string): Promise<number> {
    const metadata = await this.getVerseMetadata(verse);
    return metadata?.wordCount || 0;
  },

  /**
   * Fetch audio URL for a specific verse
   * Uses Quran.com CDN for recitation audio
   */
  async getAudioUrl(surah: number, verse: number): Promise<string | null> {
    const cacheKey = `audio_url_${surah}_${verse}`;
    const cached = getFromCache<string>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(
        `${QURAN_API_BASE_URL}/verses/by_number/${surah}/${verse}?fields=audio`
      );

      if (!response.ok) {
        console.warn(`Failed to fetch audio URL for ${surah}:${verse}`);
        return null;
      }

      const data = await response.json();
      const audioUrl = data.verse?.audio?.url;

      if (audioUrl) {
        setCache(cacheKey, audioUrl);
        return audioUrl;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching audio URL for ${surah}:${verse}:`, error);
      return null;
    }
  },

  /**
   * Fetch chapter (surah) metadata
   */
  async getChapterMetadata(surah: number): Promise<any | null> {
    const cacheKey = `chapter_metadata_${surah}`;
    const cached = getFromCache<any>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${QURAN_API_BASE_URL}/chapters/${surah}`);

      if (!response.ok) {
        console.warn(`Failed to fetch chapter ${surah} metadata`);
        return null;
      }

      const data = await response.json();
      const chapterData = data.chapter;

      if (chapterData) {
        setCache(cacheKey, chapterData);
        return chapterData;
      }

      return null;
    } catch (error) {
      console.error(`Error fetching chapter ${surah} metadata:`, error);
      return null;
    }
  },

  /**
   * Clear the cache
   * Useful for testing or manual cache refresh
   */
  clearCache(): void {
    cache.clear();
  },

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): {
    size: number;
    entries: Array<{ key: string; timestamp: number; age: number }>;
  } {
    const entries = Array.from(cache.entries()).map(([key, entry]) => ({
      key,
      timestamp: entry.timestamp,
      age: Date.now() - entry.timestamp,
    }));

    return {
      size: cache.size,
      entries,
    };
  },
};
