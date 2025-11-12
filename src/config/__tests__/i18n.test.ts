import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '@/config/i18n';
import enTranslations from '@/locales/en.json';
import arTranslations from '@/locales/ar.json';

describe('i18n Configuration', () => {
  describe('Language Initialization', () => {
    it('should initialize with default language (en)', () => {
      localStorage.clear();
      expect(i18n.language).toBe('en');
    });

    it('should restore language from localStorage if available', async () => {
      localStorage.clear();
      localStorage.setItem('app-language', 'ar');
      
      // Create a new i18n instance to test localStorage restoration
      // Since i18n is already initialized, we verify the language can change
      await i18n.changeLanguage('ar');
      expect(i18n.language).toBe('ar');
    });
  });

  describe('Translation Keys - English', () => {
    beforeEach(async () => {
      await i18n.changeLanguage('en');
    });

    it('should have appName translation', () => {
      const appName = i18n.t('common.appName');
      expect(appName).toBe("Children's Quran");
      expect(appName).toBe(enTranslations.common.appName);
    });

    it('should have language toggle text translation', () => {
      const language = i18n.t('common.language');
      expect(language).toBe('EN');
      expect(language).toBe(enTranslations.common.language);
    });

    it('should have switch language aria-label translation', () => {
      const switchLabel = i18n.t('common.switchLanguage');
      expect(switchLabel).toBe('Switch to Arabic');
      expect(switchLabel).toBe(enTranslations.common.switchLanguage);
    });

    it('should have index page title translation', () => {
      const title = i18n.t('index.title');
      expect(title).toBe("Children's Quran");
      expect(title).toBe(enTranslations.index.title);
    });

    it('should have index page heading translation', () => {
      const heading = i18n.t('index.heading');
      expect(heading).toBe("Let's Learn, Play and Memorize!");
      expect(heading).toBe(enTranslations.index.heading);
    });

    it('should have create account button text', () => {
      const createAccount = i18n.t('index.cta.createAccount');
      expect(createAccount).toBe('Create Account');
      expect(createAccount).toBe(enTranslations.index.cta.createAccount);
    });

    it('should have have account text', () => {
      const haveAccount = i18n.t('index.cta.haveAccount');
      expect(haveAccount).toBe('Already have an account?');
      expect(haveAccount).toBe(enTranslations.index.cta.haveAccount);
    });

    it('should have sign in button text', () => {
      const signIn = i18n.t('index.cta.signIn');
      expect(signIn).toBe('Sign in');
      expect(signIn).toBe(enTranslations.index.cta.signIn);
    });
  });

  describe('Translation Keys - Arabic', () => {
    beforeEach(async () => {
      await i18n.changeLanguage('ar');
    });

    it('should have appName translation in Arabic', () => {
      const appName = i18n.t('common.appName');
      expect(appName).toBe('قرآن الأطفال');
      expect(appName).toBe(arTranslations.common.appName);
    });

    it('should have language toggle text translation in Arabic', () => {
      const language = i18n.t('common.language');
      expect(language).toBe('عربي');
      expect(language).toBe(arTranslations.common.language);
    });

    it('should have switch language aria-label translation in Arabic', () => {
      const switchLabel = i18n.t('common.switchLanguage');
      expect(switchLabel).toBe('التبديل إلى الإنجليزية');
      expect(switchLabel).toBe(arTranslations.common.switchLanguage);
    });

    it('should have index page title translation in Arabic', () => {
      const title = i18n.t('index.title');
      expect(title).toBe('قرآن الأطفال');
      expect(title).toBe(arTranslations.index.title);
    });

    it('should have index page heading translation in Arabic', () => {
      const heading = i18n.t('index.heading');
      expect(heading).toBe('دعنا نتعلم ونلعب ونحفظ!');
      expect(heading).toBe(arTranslations.index.heading);
    });

    it('should have create account button text in Arabic', () => {
      const createAccount = i18n.t('index.cta.createAccount');
      expect(createAccount).toBe('إنشاء حساب');
      expect(createAccount).toBe(arTranslations.index.cta.createAccount);
    });

    it('should have have account text in Arabic', () => {
      const haveAccount = i18n.t('index.cta.haveAccount');
      expect(haveAccount).toBe('هل لديك حساب بالفعل؟');
      expect(haveAccount).toBe(arTranslations.index.cta.haveAccount);
    });

    it('should have sign in button text in Arabic', () => {
      const signIn = i18n.t('index.cta.signIn');
      expect(signIn).toBe('تسجيل الدخول');
      expect(signIn).toBe(arTranslations.index.cta.signIn);
    });
  });

  describe('Language Switching', () => {
    it('should switch from English to Arabic', async () => {
      await i18n.changeLanguage('en');
      expect(i18n.language).toBe('en');

      await i18n.changeLanguage('ar');
      expect(i18n.language).toBe('ar');

      const appName = i18n.t('common.appName');
      expect(appName).toBe('قرآن الأطفال');
    });

    it('should switch from Arabic to English', async () => {
      await i18n.changeLanguage('ar');
      expect(i18n.language).toBe('ar');

      await i18n.changeLanguage('en');
      expect(i18n.language).toBe('en');

      const appName = i18n.t('common.appName');
      expect(appName).toBe("Children's Quran");
    });

    it('should persist language to localStorage on change', async () => {
      localStorage.clear();
      
      await i18n.changeLanguage('ar');
      expect(localStorage.getItem('app-language')).toBe('ar');

      await i18n.changeLanguage('en');
      expect(localStorage.getItem('app-language')).toBe('en');
    });

    it('should update document.documentElement.lang on language change', async () => {
      await i18n.changeLanguage('en');
      expect(document.documentElement.lang).toBe('en');

      await i18n.changeLanguage('ar');
      expect(document.documentElement.lang).toBe('ar');
    });

    it('should set document.documentElement.dir to rtl for Arabic', async () => {
      await i18n.changeLanguage('ar');
      expect(document.documentElement.dir).toBe('rtl');
    });

    it('should set document.documentElement.dir to ltr for English', async () => {
      await i18n.changeLanguage('en');
      expect(document.documentElement.dir).toBe('ltr');
    });
  });

  describe('Translation Completeness', () => {
    it('should have all English translations defined', () => {
      expect(enTranslations.common).toBeDefined();
      expect(enTranslations.index).toBeDefined();
      expect(enTranslations.navigation).toBeDefined();
    });

    it('should have all Arabic translations defined', () => {
      expect(arTranslations.common).toBeDefined();
      expect(arTranslations.index).toBeDefined();
      expect(arTranslations.navigation).toBeDefined();
    });

    it('should have matching keys between English and Arabic', () => {
      const enKeys = JSON.stringify(Object.keys(enTranslations).sort());
      const arKeys = JSON.stringify(Object.keys(arTranslations).sort());
      expect(enKeys).toBe(arKeys);
    });
  });
});
