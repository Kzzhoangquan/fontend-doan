import { useTranslation } from 'react-i18next';

/**
 * Custom hook để sử dụng i18n với type safety
 */
export const useI18n = () => {
  const { t, i18n } = useTranslation();

  /**
   * Chuyển đổi ngôn ngữ
   */
  const changeLanguage = (lang: 'en' | 'vi') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  /**
   * Lấy ngôn ngữ hiện tại
   */
  const currentLanguage = i18n.language as 'en' | 'vi';

  /**
   * Kiểm tra ngôn ngữ
   */
  const isVietnamese = currentLanguage === 'vi';
  const isEnglish = currentLanguage === 'en';

  return {
    t,
    i18n,
    changeLanguage,
    currentLanguage,
    isVietnamese,
    isEnglish,
  };
};

/**
 * Helper function để dịch message với entity
 */
export const translateMessage = (
  t: (key: string, options?: any) => string,
  type: 'success' | 'error' | 'confirm',
  action: 'created' | 'updated' | 'deleted' | 'loadFailed' | 'createFailed' | 'updateFailed' | 'deleteFailed' | 'delete' | 'remove',
  entity: string
) => {
  return t(`messages.${type}.${action}`, { entity });
};

/**
 * Hook cho project-specific translations
 */
export const useProjectI18n = () => {
  const { t } = useI18n();

  return {
    t,
    projectHeader: {
      project: t('projectHeader.project'),
      lead: t('projectHeader.lead'),
      viewDetails: t('projectHeader.viewDetails'),
      tabs: {
        summary: t('projectHeader.tabs.summary'),
        sprintBacklog: t('projectHeader.tabs.sprintBacklog'),
        board: t('projectHeader.tabs.board'),
        epics: t('projectHeader.tabs.epics'),
        team: t('projectHeader.tabs.team'),
        roles: t('projectHeader.tabs.roles'),
        notifications: t('projectHeader.tabs.notifications'),
      },
    },
  };
};